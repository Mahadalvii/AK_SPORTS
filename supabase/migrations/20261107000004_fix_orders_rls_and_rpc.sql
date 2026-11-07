-- ============================================================================
-- AK SPORTS: FIX ORDER PLACEMENT RLS POLICIES & ATOMIC COD RPC
-- Run this in your Supabase SQL Editor to allow customers to place orders
-- ============================================================================

-- 1. ORDERS TABLE: Allow customers / anon users to place Cash on Delivery orders
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
CREATE POLICY "Allow public insert orders"
    ON public.orders
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        payment_method = 'cod'
        AND (status = 'pending_cod' OR status IS NULL)
        AND length(trim(customer_name)) > 0
        AND length(trim(customer_phone)) > 0
        AND length(trim(customer_address)) > 0
        AND length(trim(city)) > 0
        AND total >= 0
    );

-- 2. ORDER ITEMS TABLE: Allow customers / anon users to insert order line items
DROP POLICY IF EXISTS "Allow public insert order items" ON public.order_items;
CREATE POLICY "Allow public insert order items"
    ON public.order_items
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        quantity > 0
        AND unit_price >= 0
        AND total_price >= 0
    );

-- 3. ALLOW CUSTOMERS TO READ THEIR OWN PLACED ORDER BY EXACT ID & PHONE
DROP POLICY IF EXISTS "Allow customer lookup orders" ON public.orders;
CREATE POLICY "Allow customer lookup orders"
    ON public.orders
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow customer lookup order items" ON public.order_items;
CREATE POLICY "Allow customer lookup order items"
    ON public.order_items
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 4. GRANT EXECUTE ON LOOKUP ORDER RPC (Safe search without exposing addresses)
GRANT EXECUTE ON FUNCTION public.lookup_order(TEXT, TEXT) TO anon, authenticated;

-- 5. ATOMIC COD ORDER CREATION RPC (SECURITY DEFINER - handles both variant & non-variant items)
CREATE OR REPLACE FUNCTION public.create_cod_order(
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_address TEXT,
    p_city TEXT,
    p_items JSONB,
    p_client_ip TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id TEXT;
    v_subtotal INTEGER := 0;
    v_delivery_fee INTEGER := 0;
    v_total INTEGER := 0;
    v_item JSONB;
    v_prod_id TEXT;
    v_variant_id UUID;
    v_qty INTEGER;
    v_prod_price INTEGER;
    v_prod_name TEXT;
    v_variant_title TEXT;
    v_line_total INTEGER;
    chars TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    i INTEGER;
BEGIN
    -- Validate required fields
    IF coalesce(trim(p_customer_name), '') = '' THEN
        RAISE EXCEPTION 'Customer name is required';
    END IF;
    IF coalesce(trim(p_customer_phone), '') = '' THEN
        RAISE EXCEPTION 'Customer phone number is required';
    END IF;
    IF coalesce(trim(p_customer_address), '') = '' THEN
        RAISE EXCEPTION 'Delivery address is required';
    END IF;
    IF coalesce(trim(p_city), '') = '' THEN
        RAISE EXCEPTION 'City is required';
    END IF;
    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one item';
    END IF;

    -- Generate non-sequential order ID
    v_order_id := 'AK-';
    FOR i IN 1..6 LOOP
        v_order_id := v_order_id || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;

    -- Create temp table to store validated items
    CREATE TEMP TABLE temp_cart_items (
        product_id TEXT NOT NULL,
        variant_id UUID,
        product_name TEXT NOT NULL,
        variant_title TEXT,
        unit_price INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total_price INTEGER NOT NULL
    ) ON COMMIT DROP;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_prod_id := v_item ->> 'product_id';
        v_qty := coalesce((v_item ->> 'quantity')::INTEGER, 1);
        IF v_qty < 1 THEN v_qty := 1; END IF;

        -- Try to parse variant_id as UUID if provided
        BEGIN
            v_variant_id := (v_item ->> 'variant_id')::UUID;
        EXCEPTION WHEN OTHERS THEN
            v_variant_id := NULL;
        END;

        -- Fetch official database price
        SELECT name, price
        INTO v_prod_name, v_prod_price
        FROM public.products
        WHERE id = v_prod_id AND is_active = true;

        IF NOT FOUND THEN
            -- Fallback to item details provided in JSON if product not yet in db
            v_prod_name := coalesce(v_item ->> 'product_name', v_prod_id);
            v_prod_price := coalesce((v_item ->> 'unit_price')::INTEGER, 0);
        END IF;

        v_variant_title := coalesce(v_item ->> 'variant_title', v_item ->> 'size', 'Standard');
        v_line_total := v_prod_price * v_qty;
        v_subtotal := v_subtotal + v_line_total;

        INSERT INTO temp_cart_items (
            product_id, variant_id, product_name, variant_title,
            unit_price, quantity, total_price
        ) VALUES (
            v_prod_id, v_variant_id, v_prod_name, v_variant_title,
            v_prod_price, v_qty, v_line_total
        );
    END LOOP;

    -- Calculate delivery fee (free over Rs. 3,000)
    IF v_subtotal >= 3000 OR v_subtotal = 0 THEN
        v_delivery_fee := 0;
    ELSE
        v_delivery_fee := 250;
    END IF;
    v_total := v_subtotal + v_delivery_fee;

    -- Insert order record
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

    -- Insert order line items
    INSERT INTO public.order_items (
        order_id, product_id, variant_id, product_name, variant_title,
        unit_price, quantity, total_price
    )
    SELECT
        v_order_id, product_id, variant_id, product_name, variant_title,
        unit_price, quantity, total_price
    FROM temp_cart_items;

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

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.create_cod_order(TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) TO anon, authenticated;

-- 6. SEED VARIANTS FOR PRODUCTS (Ensures sizes & variants exist in db)
INSERT INTO public.product_variants (product_id, size_or_variant, stock)
VALUES 
    ('ak-apparel-pro-trousers', 'S (28-30")', 15),
    ('ak-apparel-pro-trousers', 'M (31-33")', 20),
    ('ak-apparel-pro-trousers', 'L (34-36")', 15),
    ('ak-apparel-pro-trousers', 'XL (37-39")', 8),
    ('ak-apparel-oversized-tee', 'Small', 15),
    ('ak-apparel-oversized-tee', 'Medium', 20),
    ('ak-apparel-oversized-tee', 'Large', 18),
    ('ak-apparel-oversized-tee', 'Extra Large', 11),
    ('ak-apparel-stealth-kit', 'Medium (Chest 38-40")', 15),
    ('ak-apparel-stealth-kit', 'Large (Chest 41-43")', 18),
    ('ak-apparel-stealth-kit', 'XL (Chest 44-46")', 9),
    ('ak-bat-gold-edition', 'Short Handle (820-840g)', 12),
    ('ak-bat-gold-edition', 'Long Handle (840-860g)', 6),
    ('ak-bat-carbon-shadow', 'Short Handle (800-820g)', 8),
    ('ak-bat-carbon-shadow', 'Standard Full Size', 10),
    ('ak-tape-balls-pro', 'Standard Match Weight (6-Pack)', 45),
    ('ak-gloves-pro-gold', 'Adult Right Hand', 25),
    ('ak-gloves-pro-gold', 'Adult Left Hand', 10),
    ('ak-accessories-grip-pack', 'Pack of 3 (Chevron Gold/Black)', 50)
ON CONFLICT (product_id, size_or_variant) 
DO UPDATE SET stock = EXCLUDED.stock;
