import { supabase, isSupabaseConfigured } from './supabase';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';

export interface AdminProductImage {
  id?: string;
  product_id?: string;
  url: string;
  sort_order: number;
}

export interface AdminProductVariant {
  id?: string;
  product_id?: string;
  size_or_variant: string;
  stock: number;
}

export interface AdminProduct {
  id: string; // slug
  name: string;
  category: 'apparel' | 'bats' | 'balls' | 'gloves' | 'kits';
  category_label: string;
  price: number;
  original_price?: number | null;
  rating?: number;
  reviews_count?: number;
  image_url: string;
  tag?: string | null;
  description: string;
  specs: { label: string; value: string }[];
  features: string[];
  weight?: string | null;
  video_url?: string | null;
  is_featured: boolean;
  is_active: boolean;
  variants: AdminProductVariant[];
  images: AdminProductImage[];
}

/**
 * Checks whether the currently logged-in Supabase Auth user is in public.admins
 */
export async function verifyAdminStatus(): Promise<{
  isAuthenticated: boolean;
  isAdmin: boolean;
  email?: string;
  error?: string;
}> {
  if (!isSupabaseConfigured() || !supabase) {
    // When environment variables are not yet loaded, allow local testing admin if in session
    const mockAdmin = localStorage.getItem('ak_sports_admin_mock_session');
    if (mockAdmin) {
      return { isAuthenticated: true, isAdmin: true, email: mockAdmin };
    }
    return { isAuthenticated: false, isAdmin: false };
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return { isAuthenticated: false, isAdmin: false };
    }

    const email = session.user.email;

    // Check with public.is_admin() RPC function
    const { data: isAuthAdmin, error: rpcError } = await supabase.rpc('is_admin');

    if (!rpcError && typeof isAuthAdmin === 'boolean') {
      return {
        isAuthenticated: true,
        isAdmin: isAuthAdmin,
        email,
      };
    }

    // Fallback direct check against admins table
    const { data: adminRows, error: tableError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', session.user.id)
      .limit(1);

    if (tableError) {
      console.warn('[AK Sports Admin] Error verifying admin permissions:', tableError);
      return {
        isAuthenticated: true,
        isAdmin: false,
        email,
        error: 'Could not verify admin credentials.',
      };
    }

    const hasAdminRow = Boolean(adminRows && adminRows.length > 0);
    return {
      isAuthenticated: true,
      isAdmin: hasAdminRow,
      email,
    };
  } catch (err: any) {
    console.error('[AK Sports Admin] Exception checking admin status:', err);
    return {
      isAuthenticated: false,
      isAdmin: false,
      error: err.message || 'Error communicating with Supabase Auth',
    };
  }
}

/**
 * Fetch all products (including inactive/hidden) with variants and gallery images
 */
export async function getAdminProducts(): Promise<AdminProduct[]> {
  if (!isSupabaseConfigured() || !supabase) {
    // Local fallback seeded from products.ts
    const localSaved = localStorage.getItem('ak_sports_admin_products');
    if (localSaved) {
      try {
        return JSON.parse(localSaved);
      } catch (e) {
        // fallback to default PRODUCTS
      }
    }
    return PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      category_label: p.categoryLabel,
      price: p.price,
      original_price: p.originalPrice || null,
      rating: p.rating,
      reviews_count: p.reviewsCount,
      image_url: p.image,
      tag: p.tag || null,
      description: p.description,
      specs: p.specs || [],
      features: p.features || [],
      weight: p.weight || null,
      video_url: null,
      is_featured: p.isFeatured || false,
      is_active: true,
      variants: (p.variants || (p.sizes || []).map((s, idx) => ({
        id: `var-${p.id}-${idx}`,
        size: s,
        stock: p.stock || 15,
      }))).map((v: any) => ({
        id: v.id,
        size_or_variant: v.size || v.size_or_variant || 'Standard',
        stock: v.stock ?? 15,
      })),
      images: [
        { url: p.image, sort_order: 0 },
      ],
    }));
  }

  try {
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (prodError || !dbProducts) {
      console.warn('[AK Sports Admin] Error reading products from Supabase:', prodError);
      return [];
    }

    // Fetch all variants
    const { data: dbVariants } = await supabase
      .from('product_variants')
      .select('*');

    // Fetch all product_images
    const { data: dbImages } = await supabase
      .from('product_images')
      .select('*')
      .order('sort_order', { ascending: true });

    return dbProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      category_label: p.category_label,
      price: p.price,
      original_price: p.original_price,
      rating: p.rating,
      reviews_count: p.reviews_count,
      image_url: p.image_url,
      tag: p.tag,
      description: p.description,
      specs: p.specs || [],
      features: p.features || [],
      weight: p.weight,
      video_url: p.video_url,
      is_featured: p.is_featured,
      is_active: p.is_active,
      variants: (dbVariants || [])
        .filter((v: any) => v.product_id === p.id)
        .map((v: any) => ({
          id: v.id,
          product_id: v.product_id,
          size_or_variant: v.size_or_variant,
          stock: v.stock,
        })),
      images: (dbImages || [])
        .filter((img: any) => img.product_id === p.id)
        .map((img: any) => ({
          id: img.id,
          product_id: img.product_id,
          url: img.url,
          sort_order: img.sort_order,
        })),
    }));
  } catch (err) {
    console.error('[AK Sports Admin] Exception loading products:', err);
    return [];
  }
}

/**
 * Save (create or update) product, variants, and gallery images
 */
export async function saveAdminProduct(
  productData: AdminProduct
): Promise<{ success: boolean; error?: string }> {
  // RULE 7: Validate whole rupees and non-negative price
  if (!Number.isInteger(productData.price) || productData.price < 0) {
    return {
      success: false,
      error: 'Selling price must be a non-negative whole rupee amount (PKR).',
    };
  }

  // RULE 7: Original price cannot be lower than selling price
  if (
    productData.original_price !== null &&
    productData.original_price !== undefined
  ) {
    if (!Number.isInteger(productData.original_price)) {
      return {
        success: false,
        error: 'Original price must be a whole rupee amount (PKR).',
      };
    }
    if (productData.original_price < productData.price) {
      return {
        success: false,
        error: `Original price (Rs. ${productData.original_price.toLocaleString()}) cannot be less than the selling price (Rs. ${productData.price.toLocaleString()}).`,
      };
    }
  }

  if (!productData.name.trim()) {
    return { success: false, error: 'Product name is required.' };
  }
  if (!productData.id.trim()) {
    return { success: false, error: 'Product slug ID is required.' };
  }

  // SECURITY RULE 2: Validate video_url if provided
  if (productData.video_url && productData.video_url.trim()) {
    const videoCheck = validateVideoUrl(productData.video_url);
    if (!videoCheck.valid) {
      return { success: false, error: videoCheck.error };
    }
  }

  if (!isSupabaseConfigured() || !supabase) {
    // Local storage persistence fallback
    const current = await getAdminProducts();
    const existingIndex = current.findIndex(p => p.id === productData.id);
    let updated: AdminProduct[];
    if (existingIndex > -1) {
      updated = [...current];
      updated[existingIndex] = productData;
    } else {
      updated = [productData, ...current];
    }
    localStorage.setItem('ak_sports_admin_products', JSON.stringify(updated));
    return { success: true };
  }

  try {
    // 1. Upsert product table
    const { error: prodError } = await supabase
      .from('products')
      .upsert({
        id: productData.id,
        name: productData.name,
        category: productData.category,
        category_label: productData.category_label,
        price: productData.price,
        original_price: productData.original_price,
        image_url: productData.image_url,
        tag: productData.tag,
        description: productData.description,
        specs: productData.specs,
        features: productData.features,
        weight: productData.weight,
        video_url: productData.video_url,
        is_featured: productData.is_featured,
        is_active: productData.is_active,
      });

    if (prodError) {
      return { success: false, error: prodError.message };
    }

    // 2. Upsert Variants
    for (const v of productData.variants) {
      const variantPayload: any = {
        product_id: productData.id,
        size_or_variant: v.size_or_variant,
        stock: Math.max(0, Math.floor(v.stock)),
      };
      if (v.id && !v.id.startsWith('temp-')) {
        variantPayload.id = v.id;
      }

      await supabase
        .from('product_variants')
        .upsert(variantPayload, { onConflict: 'product_id, size_or_variant' });
    }

    // 3. Upsert product images
    if (productData.images && productData.images.length > 0) {
      // Clear old image associations for this product
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productData.id);

      const imagesToInsert = productData.images.map((img, idx) => ({
        product_id: productData.id,
        url: img.url,
        sort_order: idx,
      }));

      await supabase
        .from('product_images')
        .insert(imagesToInsert);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Database error saving product' };
  }
}

/**
 * Toggle product is_active status (Show / Hide on store)
 */
export async function toggleProductActive(
  productId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    const current = await getAdminProducts();
    const updated = current.map(p => p.id === productId ? { ...p, is_active: isActive } : p);
    localStorage.setItem('ak_sports_admin_products', JSON.stringify(updated));
    return { success: true };
  }

  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Delete a product permanently
 */
export async function deleteAdminProduct(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    const current = await getAdminProducts();
    const updated = current.filter(p => p.id !== productId);
    localStorage.setItem('ak_sports_admin_products', JSON.stringify(updated));
    return { success: true };
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Delete an individual product variant
 */
export async function deleteAdminVariant(
  variantId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: true };
  }

  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', variantId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Security Rule 2:
 * video_url: accept only https links on youtube.com, youtu.be, or instagram.com,
 * or a file URL from our own Supabase storage bucket (product-images). Reject everything else.
 */
export function validateVideoUrl(url: string | null | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!url || !url.trim()) {
    return { valid: true };
  }

  const trimmed = url.trim();

  // Enforce HTTPS
  if (!trimmed.startsWith('https://')) {
    return {
      valid: false,
      error: 'Security rejection: video_url must begin with "https://". Insecure HTTP, JavaScript, and data URLs are rejected.',
    };
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'https:') {
      return {
        valid: false,
        error: 'Only HTTPS video links are permitted.',
      };
    }

    const host = parsed.hostname.toLowerCase();

    // 1. YouTube
    const isYouTube =
      host === 'youtube.com' ||
      host === 'www.youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtu.be';

    // 2. Instagram
    const isInstagram =
      host === 'instagram.com' ||
      host === 'www.instagram.com';

    // 3. Project's Supabase Storage bucket
    const isSupabaseBucket =
      host.endsWith('.supabase.co') &&
      parsed.pathname.includes('/storage/v1/object/public/product-images/');

    // Local/blob preview mode
    const isBlobPreview = trimmed.startsWith('blob:https');

    if (!isYouTube && !isInstagram && !isSupabaseBucket && !isBlobPreview) {
      return {
        valid: false,
        error: 'Security rejection: video_url only accepts https links from youtube.com, youtu.be, instagram.com, or your Supabase product-images storage bucket. External untrusted sites are blocked.',
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Invalid video URL syntax.',
    };
  }
}

export interface SafeVideoEmbed {
  type: 'youtube' | 'instagram' | 'direct' | 'unsupported';
  embedUrl?: string;
  directSrc?: string;
}

export function getSafeVideoEmbed(url: string | null | undefined): SafeVideoEmbed {
  if (!url || !url.trim()) return { type: 'unsupported' };
  const check = validateVideoUrl(url);
  if (!check.valid) return { type: 'unsupported' };

  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    // YouTube short link (youtu.be/ID)
    if (host === 'youtu.be') {
      const videoId = parsed.pathname.substring(1).split(/[?#&]/)[0];
      if (/^[a-zA-Z0-9_-]{6,15}$/.test(videoId)) {
        return {
          type: 'youtube',
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        };
      }
    }

    // YouTube standard link
    if (host.includes('youtube.com')) {
      let videoId = parsed.searchParams.get('v');
      if (!videoId && (parsed.pathname.startsWith('/embed/') || parsed.pathname.startsWith('/shorts/'))) {
        videoId = parsed.pathname.split('/')[2];
      }
      if (videoId && /^[a-zA-Z0-9_-]{6,15}$/.test(videoId)) {
        return {
          type: 'youtube',
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        };
      }
    }

    // Instagram Reel / Post
    if (host.includes('instagram.com')) {
      const match = parsed.pathname.match(/\/(p|reel)\/([a-zA-Z0-9_-]+)/);
      if (match && match[2]) {
        return {
          type: 'instagram',
          embedUrl: `https://www.instagram.com/p/${match[2]}/embed/captioned/`,
        };
      }
    }

    // Direct MP4 from Supabase storage
    if (trimmed.endsWith('.mp4') || trimmed.includes('/product-images/')) {
      return {
        type: 'direct',
        directSrc: trimmed,
      };
    }

    return { type: 'unsupported' };
  } catch {
    return { type: 'unsupported' };
  }
}

/**
 * Upload an already browser-compressed image to Supabase Storage bucket 'product-images'
 */
export async function uploadProductImageToStorage(
  file: File,
  productId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Security Rule 4: Validate file type and size in browser
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!file.type || !allowedImageTypes.includes(file.type.toLowerCase())) {
    return {
      success: false,
      error: `Security rejection: File type "${file.type || 'unknown'}" is prohibited. Only JPEG, PNG, or WebP images are allowed.`,
    };
  }

  if (file.size > 300 * 1024) {
    return {
      success: false,
      error: `Image exceeds the 300 KB limit (${Math.round(file.size / 1024)} KB). Compression must be under 300 KB.`,
    };
  }

  if (file.size === 0) {
    return { success: false, error: 'File is empty (0 bytes).' };
  }

  if (!isSupabaseConfigured() || !supabase) {
    // Offline simulation
    const fakeUrl = URL.createObjectURL(file);
    return { success: true, url: fakeUrl };
  }

  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${productId}/${timestamp}_${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    return { success: true, url: publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message || 'Image upload failed' };
  }
}

/**
 * Upload a product video file (MP4 strictly under 10 MB)
 */
export async function uploadProductVideoToStorage(
  file: File,
  productId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  // Security Rule 4 & 5: Validate file type and size in the browser
  if (file.size === 0) {
    return {
      success: false,
      error: 'Video file is empty (0 bytes).',
    };
  }

  const maxBytes = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxBytes) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      success: false,
      error: `Video file exceeds maximum limit of 10 MB (Selected file: ${sizeMB} MB). Please compress the video or provide a YouTube / Instagram link.`,
    };
  }

  const isMp4Type = file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4');
  if (!isMp4Type) {
    return {
      success: false,
      error: 'Security rejection: Only .mp4 video files under 10 MB are accepted.',
    };
  }

  if (!isSupabaseConfigured() || !supabase) {
    const fakeUrl = URL.createObjectURL(file);
    return { success: true, url: fakeUrl };
  }

  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `videos/${productId}_${timestamp}_${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    return { success: true, url: publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message || 'Video upload failed' };
  }
}
