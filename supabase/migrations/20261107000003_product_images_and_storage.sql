-- ============================================================================
-- AK SPORTS: PRODUCT IMAGES, STORAGE BUCKET & RLS POLICIES (Phase 3)
-- Target: Supabase (PostgreSQL 15+)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ADD video_url COLUMN TO PRODUCTS TABLE (IF NOT EXISTS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- ----------------------------------------------------------------------------
-- 2. CREATE product_images TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for ordering product gallery images
CREATE INDEX IF NOT EXISTS idx_product_images_product 
    ON public.product_images(product_id, sort_order ASC);

-- ----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) FOR product_images TABLE
-- ----------------------------------------------------------------------------
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Public read access for storefront gallery displays
CREATE POLICY "Allow public read product images"
    ON public.product_images
    FOR SELECT
    USING (true);

-- Admin-only write access (INSERT, UPDATE, DELETE)
CREATE POLICY "Allow admin write product images"
    ON public.product_images
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. SUPABASE STORAGE BUCKET: product-images
-- ----------------------------------------------------------------------------
-- Provision or update the public 'product-images' bucket with 10MB file limit
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    10485760, -- 10 MB limit (accommodates max 10MB MP4 videos & compressed images)
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];

-- ----------------------------------------------------------------------------
-- 5. STORAGE RLS POLICIES FOR storage.objects (product-images bucket)
-- ----------------------------------------------------------------------------

-- Public can view/download images and videos from 'product-images'
DROP POLICY IF EXISTS "Allow public read product images storage" ON storage.objects;
CREATE POLICY "Allow public read product images storage"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'product-images');

-- Only verified admins can upload files to 'product-images'
DROP POLICY IF EXISTS "Allow admin upload product images storage" ON storage.objects;
CREATE POLICY "Allow admin upload product images storage"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'product-images' 
        AND public.is_admin()
    );

-- Only verified admins can update files in 'product-images'
DROP POLICY IF EXISTS "Allow admin update product images storage" ON storage.objects;
CREATE POLICY "Allow admin update product images storage"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'product-images' 
        AND public.is_admin()
    )
    WITH CHECK (
        bucket_id = 'product-images' 
        AND public.is_admin()
    );

-- Only verified admins can delete files from 'product-images'
DROP POLICY IF EXISTS "Allow admin delete product images storage" ON storage.objects;
CREATE POLICY "Allow admin delete product images storage"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'product-images' 
        AND public.is_admin()
    );
