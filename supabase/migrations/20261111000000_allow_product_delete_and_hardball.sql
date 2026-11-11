-- ============================================================================
-- AK SPORTS: ALLOW SAFE PRODUCT DELETION & ADD 'hardball' CATEGORY
-- Run this in your Supabase SQL Editor if you want to permanently delete
-- products that already appear in past orders, or save 'hardball' products.
-- ============================================================================

-- 1. Allow 'hardball' in products.category check constraint
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_category_check;

ALTER TABLE public.products
ADD CONSTRAINT products_category_check
CHECK (category IN ('apparel', 'bats', 'balls', 'gloves', 'kits', 'hardball'));

-- 2. Allow products & variants to be deleted without breaking historical order_items
-- (order_items already preserves product_name, variant_title, unit_price, total_price)
ALTER TABLE public.order_items
ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_product_id_fkey
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_variant_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_variant_id_fkey
FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;

-- 3. Grant admin write access on order_items
DROP POLICY IF EXISTS "Allow admin write order items" ON public.order_items;
CREATE POLICY "Allow admin write order items"
    ON public.order_items
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
