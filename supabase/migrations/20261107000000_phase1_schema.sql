-- ============================================================================
-- AK SPORTS: E-COMMERCE DATABASE SCHEMA (Phase 1)
-- Target: Supabase (PostgreSQL 15+)
-- ============================================================================

-- Enable pgcrypto for UUIDs if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ADMINS TABLE & ADMIN VERIFICATION FUNCTION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Secure is_admin() helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. AUTOMATIC updated_at TRIGGER FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. STORE SETTINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'store_settings',
    free_delivery_threshold INTEGER NOT NULL DEFAULT 3000,
    delivery_fee INTEGER NOT NULL DEFAULT 250,
    currency TEXT NOT NULL DEFAULT 'PKR',
    whatsapp_helpline TEXT NOT NULL DEFAULT '+923000000000',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE TRIGGER trg_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. PRODUCTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY, -- Slug matching src/data/products.ts
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('apparel', 'bats', 'balls', 'gloves', 'kits')),
    category_label TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    original_price INTEGER CHECK (original_price >= 0),
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
    image_url TEXT NOT NULL,
    tag TEXT,
    description TEXT NOT NULL,
    specs JSONB NOT NULL DEFAULT '[]'::jsonb,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    weight TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. PRODUCT VARIANTS TABLE (Size, Weight & Individual Stock)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size_or_variant TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_product_variant UNIQUE (product_id, size_or_variant)
);

CREATE OR REPLACE TRIGGER trg_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 6. ORDERS TABLE (Cash on Delivery Only for now)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- Non-sequential ID e.g. 'AK-7F3K9Q'
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL, -- Format: 03XX-XXXXXXX
    customer_address TEXT NOT NULL,
    city TEXT NOT NULL,
    subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
    delivery_fee INTEGER NOT NULL CHECK (delivery_fee >= 0),
    total INTEGER NOT NULL CHECK (total >= 0),
    payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod')),
    status TEXT NOT NULL DEFAULT 'pending_cod' CHECK (status IN ('pending_cod', 'processing', 'dispatched', 'delivered', 'cancelled')),
    client_ip TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE OR REPLACE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 7. ORDER ITEMS TABLE (Line Items for Each Order)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    product_name TEXT NOT NULL,
    variant_title TEXT,
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price INTEGER NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 8. INDEXES FOR PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_variants_prod ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Admins: No public policies. Only verified admins can view admin table
CREATE POLICY "Allow admin read admins"
    ON public.admins
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Settings: Public can read active delivery thresholds and helpline
CREATE POLICY "Allow public read settings"
    ON public.settings
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin write settings"
    ON public.settings
    FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Products: Public can read active products only
CREATE POLICY "Allow public read active products"
    ON public.products
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Allow admin write products"
    ON public.products
    FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Variants: Public can read variants for in-stock display
CREATE POLICY "Allow public read variants"
    ON public.product_variants
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin write variants"
    ON public.product_variants
    FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Orders & Order Items: NO public browser read policy.
-- Anonymous browser clients CANNOT read orders or customer info directly.
-- Orders can only be queried through the secure server-side RPC / service key or by authenticated admin.
CREATE POLICY "Allow admin read orders"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin write orders"
    ON public.orders
    FOR ALL
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Allow admin read order items"
    ON public.order_items
    FOR SELECT
    TO authenticated
    USING (public.is_admin());
