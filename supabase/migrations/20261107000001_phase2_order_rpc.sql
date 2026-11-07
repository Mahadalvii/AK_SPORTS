-- ============================================================================
-- AK SPORTS: PHASE 2 ATOMIC ORDER CREATION, SECURE LOOKUP & RATE LIMITING
-- Target: Supabase (PostgreSQL 15+)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. RATE LIMITS TABLE & FUNCTION (Service Role Only)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    window_start TIMESTAMPTZ NOT NULL,
    count INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No public RLS policies: inaccessible from client browsers

CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key TEXT,
    p_max INTEGER,
    p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_window_start TIMESTAMPTZ;
    v_current_count INTEGER;
BEGIN
    IF p_key IS NULL OR trim(p_key) = '' THEN
        RETURN true;
    END IF;

    SELECT window_start, count
    INTO v_window_start, v_current_count
    FROM public.rate_limits
    WHERE key = p_key
    FOR UPDATE;

    IF FOUND THEN
        IF v_window_start < v_now - (p_window_seconds || ' seconds')::interval THEN
            -- Window expired, reset counter and window start
            UPDATE public.rate_limits
            SET window_start = v_now, count = 1
            WHERE key = p_key;
            RETURN true;
        ELSIF v_current_count >= p_max THEN
            -- Exceeded rate limit quota in active window
            RETURN false;
        ELSE
            -- Within quota, increment counter
            UPDATE public.rate_limits
            SET count = count + 1
            WHERE key = p_key;
            RETURN true;
        END IF;
    ELSE
        -- First request for this key, insert tracking row
        INSERT INTO public.rate_limits (key, window_start, count)
        VALUES (p_key, v_now, 1);
        RETURN true;
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

-- ----------------------------------------------------------------------------
-- 2. NON-SEQUENTIAL ORDER ID GENERATOR
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; -- Excludes ambiguous chars (0, 1, I, O)
    result TEXT := 'AK-';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. ATOMIC ORDER CREATION RPC (Service Role Only)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_order(
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_address TEXT,
    p_city TEXT,
    p_items JSONB, -- Array of { product_id: text, variant_id: uuid, quantity: integer }
    p_client_ip TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id TEXT;
    v_free_threshold INTEGER;
    v_default_fee INTEGER;
    v_subtotal INTEGER := 0;
    v_delivery_fee INTEGER := 0;
    v_total INTEGER := 0;
    v_item JSONB;
    v_product_id TEXT;
    v_variant_id UUID;
    v_qty INTEGER;
    v_prod_price INTEGER;
    v_prod_name TEXT;
    v_variant_title TEXT;
    v_current_stock INTEGER;
    v_item_total INTEGER;
    v_unique_attempt INTEGER := 0;
BEGIN
    -- 1. Validate required inputs & length constraints
    IF coalesce(trim(p_customer_name), '') = '' THEN
        RAISE EXCEPTION 'Customer name is required';
    END IF;
    IF length(trim(p_customer_name)) > 100 THEN
        RAISE EXCEPTION 'Customer name cannot exceed 100 characters';
    END IF;

    IF coalesce(trim(p_customer_phone), '') = '' THEN
        RAISE EXCEPTION 'Customer phone number is required';
    END IF;
    -- Regex validation: ^03[0-9]{2}-?[0-9]{7}$
    IF NOT (trim(p_customer_phone) ~ '^03[0-9]{2}-?[0-9]{7}$') THEN
        RAISE EXCEPTION 'Invalid phone number format. Must match 03XX-XXXXXXX';
    END IF;

    IF coalesce(trim(p_customer_address), '') = '' THEN
        RAISE EXCEPTION 'Delivery address is required';
    END IF;
    IF length(trim(p_customer_address)) > 300 THEN
        RAISE EXCEPTION 'Customer address cannot exceed 300 characters';
    END IF;

    IF coalesce(trim(p_city), '') = '' THEN
        RAISE EXCEPTION 'City is required';
    END IF;
    IF length(trim(p_city)) > 60 THEN
        RAISE EXCEPTION 'City cannot exceed 60 characters';
    END IF;

    -- 2. Validate order line count limits (1 to 20 lines)
    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one item';
    END IF;
    IF jsonb_array_length(p_items) > 20 THEN
        RAISE EXCEPTION 'Order cannot contain more than 20 lines';
    END IF;

    -- 3. Fetch current store delivery settings
    SELECT free_delivery_threshold, delivery_fee
    INTO v_free_threshold, v_default_fee
    FROM public.settings
    WHERE id = 'store_settings';

    IF NOT FOUND THEN
        v_free_threshold := 3000;
        v_default_fee := 250;
    END IF;

    -- 4. Temporary table to capture verified names, prices, and quantities
    -- Guaranteed reuse for order_items insertion so totals and line items can never differ
    CREATE TEMP TABLE temp_order_items (
        product_id TEXT NOT NULL,
        variant_id UUID NOT NULL,
        product_name TEXT NOT NULL,
        variant_title TEXT NOT NULL,
        unit_price INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total_price INTEGER NOT NULL
    ) ON COMMIT DROP;

    -- 5. Process and verify items, lock & decrement stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := v_item ->> 'product_id';
        v_variant_id := (v_item ->> 'variant_id')::UUID;
        v_qty := (v_item ->> 'quantity')::INTEGER;

        -- Require non-null variant_id on every item
        IF v_variant_id IS NULL THEN
            RAISE EXCEPTION 'Item with product ID % is missing a required variant_id', v_product_id;
        END IF;

        -- Validate line quantity limits (1 to 10)
        IF v_qty IS NULL OR v_qty < 1 OR v_qty > 10 THEN
            RAISE EXCEPTION 'Invalid quantity (%) for item %. Quantity per line must be between 1 and 10', v_qty, v_product_id;
        END IF;

        -- Fetch official database price & active status (client price never trusted)
        SELECT name, price
        INTO v_prod_name, v_prod_price
        FROM public.products
        WHERE id = v_product_id AND is_active = true;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % is invalid or no longer active', v_product_id;
        END IF;

        -- Fetch variant details & lock stock row for atomic concurrency
        SELECT size_or_variant, stock
        INTO v_variant_title, v_current_stock
        FROM public.product_variants
        WHERE id = v_variant_id AND product_id = v_product_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Variant ID % does not exist for product %', v_variant_id, v_prod_name;
        END IF;

        IF v_current_stock < v_qty THEN
            RAISE EXCEPTION 'Insufficient stock for % (%). Available: %, Requested: %', v_prod_name, v_variant_title, v_current_stock, v_qty;
        END IF;

        -- Decrement inventory stock atomically
        UPDATE public.product_variants
        SET stock = stock - v_qty
        WHERE id = v_variant_id;

        v_item_total := v_prod_price * v_qty;
        v_subtotal := v_subtotal + v_item_total;

        -- Capture into temp table
        INSERT INTO temp_order_items (
            product_id, variant_id, product_name, variant_title, unit_price, quantity, total_price
        ) VALUES (
            v_product_id, v_variant_id, v_prod_name, v_variant_title, v_prod_price, v_qty, v_item_total
        );
    END LOOP;

    -- 6. Calculate Delivery Fee
    IF v_subtotal >= v_free_threshold THEN
        v_delivery_fee := 0;
    ELSE
        v_delivery_fee := v_default_fee;
    END IF;

    v_total := v_subtotal + v_delivery_fee;

    -- 7. Generate guaranteed unique non-sequential Order ID
    LOOP
        v_order_id := public.generate_order_id();
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE id = v_order_id);
        v_unique_attempt := v_unique_attempt + 1;
        IF v_unique_attempt > 10 THEN
            RAISE EXCEPTION 'Could not generate unique order ID. Please retry.';
        END IF;
    END LOOP;

    -- 8. Insert Order Record
    INSERT INTO public.orders (
        id, customer_name, customer_phone, customer_address, city,
        subtotal, delivery_fee, total, payment_method, status, client_ip
    ) VALUES (
        v_order_id,
        trim(p_customer_name),
        trim(p_customer_phone),
        trim(p_customer_address),
        trim(p_city),
        v_subtotal,
        v_delivery_fee,
        v_total,
        'cod',
        'pending_cod',
        p_client_ip
    );

    -- 9. Insert Order Items directly from captured temp table (zero discrepancy)
    INSERT INTO public.order_items (
        order_id, product_id, variant_id, product_name, variant_title,
        unit_price, quantity, total_price
    )
    SELECT
        v_order_id, product_id, variant_id, product_name, variant_title,
        unit_price, quantity, total_price
    FROM temp_order_items;

    -- 10. Return Confirmation Summary
    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'customer_name', trim(p_customer_name),
        'customer_phone', trim(p_customer_phone),
        'subtotal', v_subtotal,
        'delivery_fee', v_delivery_fee,
        'total', v_total,
        'status', 'pending_cod',
        'payment_method', 'cod'
    );
END;
$$;

-- Restrict create_order strictly to service_role
REVOKE EXECUTE ON FUNCTION public.create_order(TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_order(TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_order(TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) TO service_role;

-- ----------------------------------------------------------------------------
-- 4. ORDER LOOKUP FUNCTION (Service Role Only)
-- Called strictly through an Edge Function with rate limiting
-- Requires BOTH Order ID AND matching Phone number together
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.lookup_order(
    p_order_id TEXT,
    p_phone TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_clean_order_id TEXT;
    v_clean_phone TEXT;
    v_order RECORD;
    v_items JSONB;
BEGIN
    v_clean_order_id := upper(trim(coalesce(p_order_id, '')));
    -- Extract only digits for resilient matching
    v_clean_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');

    IF v_clean_order_id = '' OR v_clean_phone = '' THEN
        RETURN jsonb_build_object(
            'found', false,
            'error', 'Both Order ID and Phone Number are required.'
        );
    END IF;

    -- Look up order requiring BOTH order ID and phone match
    SELECT id, status, created_at, subtotal, delivery_fee, total, payment_method
    INTO v_order
    FROM public.orders
    WHERE upper(id) = v_clean_order_id
      AND regexp_replace(customer_phone, '[^0-9]', '', 'g') = v_clean_phone;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'found', false,
            'error', 'No order found matching this Order ID and Phone Number. Please check your credentials.'
        );
    END IF;

    -- Fetch order line items (product title, variant size, quantity, unit price, total price)
    SELECT coalesce(
        jsonb_agg(
            jsonb_build_object(
                'product_name', product_name,
                'variant_title', variant_title,
                'quantity', quantity,
                'unit_price', unit_price,
                'total_price', total_price
            )
        ),
        '[]'::jsonb
    )
    INTO v_items
    FROM public.order_items
    WHERE order_id = v_order.id;

    -- Return strictly sanitized status and items (NEVER returns name, address, or phone)
    RETURN jsonb_build_object(
        'found', true,
        'order_id', v_order.id,
        'status', v_order.status,
        'created_at', v_order.created_at,
        'subtotal', v_order.subtotal,
        'delivery_fee', v_order.delivery_fee,
        'total', v_order.total,
        'payment_method', v_order.payment_method,
        'items', v_items
    );
END;
$$;

-- Restrict lookup_order strictly to service_role (invoked via Edge Function)
REVOKE EXECUTE ON FUNCTION public.lookup_order(TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.lookup_order(TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.lookup_order(TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_order(TEXT, TEXT) TO service_role;
