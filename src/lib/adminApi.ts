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
  category: 'apparel' | 'bats' | 'balls' | 'gloves' | 'kits' | 'hardball';
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
 * Delete all products permanently from the catalog
 */
export async function deleteAllAdminProducts(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    localStorage.setItem('ak_sports_admin_products', JSON.stringify([]));
    return { success: true };
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .neq('id', '');

  if (error) {
    return { success: false, error: error.message };
  }
  localStorage.removeItem('ak_sports_admin_products');
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

/**
 * Seeds the 8 default showcase products into Supabase so the admin can edit them directly
 */
export async function seedDefaultCatalog(): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  try {
    let seeded = 0;

    for (const prod of PRODUCTS) {
      const adminProduct: AdminProduct = {
        id: prod.id,
        name: prod.name,
        category: prod.category,
        category_label: prod.categoryLabel,
        price: prod.price,
        original_price: prod.originalPrice || null,
        rating: prod.rating,
        reviews_count: prod.reviewsCount,
        image_url: prod.image,
        tag: prod.tag || null,
        description: prod.description,
        specs: prod.specs || [],
        features: prod.features || [],
        weight: prod.weight || null,
        video_url: null,
        is_featured: prod.isFeatured || false,
        is_active: true,
        variants: (prod.sizes && prod.sizes.length > 0)
          ? prod.sizes.map((s, idx) => ({
              id: `var-${prod.id}-${idx}`,
              size_or_variant: s,
              stock: prod.stock ? Math.max(5, Math.round(prod.stock / prod.sizes!.length)) : 15,
            }))
          : [
              {
                id: `var-${prod.id}-0`,
                size_or_variant: 'Standard',
                stock: prod.stock || 20,
              },
            ],
        images: [
          {
            url: prod.image,
            sort_order: 0,
          },
        ],
      };

      const res = await saveAdminProduct(adminProduct);
      if (res.success) {
        seeded++;
      } else {
        console.warn(`[AK Sports Admin] Error seeding ${prod.id}:`, res.error);
      }
    }

    return { success: seeded > 0, count: seeded };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      error: err.message || 'Failed seeding default catalog',
    };
  }
}

// ============================================================================
// ORDERS MANAGEMENT API
// ============================================================================

export type OrderStatus = 'pending_cod' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';

export interface AdminOrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  variant_id?: string | null;
  product_name: string;
  variant_title?: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface AdminOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  city: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  status: OrderStatus;
  client_ip?: string | null;
  created_at: string;
  updated_at?: string;
  items: AdminOrderItem[];
}

/**
 * Format Pakistani phone number to international WhatsApp URL with pre-filled message
 */
export function formatWhatsAppUrl(order: AdminOrder): string {
  const digitsOnly = order.customer_phone.replace(/[^0-9]/g, '');
  let intlPhone = digitsOnly;
  if (intlPhone.startsWith('03')) {
    intlPhone = '92' + intlPhone.substring(1);
  } else if (intlPhone.startsWith('3') && intlPhone.length === 10) {
    intlPhone = '92' + intlPhone;
  }

  const itemsSummary = order.items
    .map(
      (item, idx) =>
        `  ${idx + 1}. ${item.product_name}${item.variant_title ? ` (${item.variant_title})` : ''} x${item.quantity} = Rs. ${item.total_price.toLocaleString()}`
    )
    .join('\n');

  const statusLabel =
    order.status === 'pending_cod'
      ? 'Pending Confirmation'
      : order.status === 'processing'
      ? 'Processing / In Packing'
      : order.status === 'dispatched'
      ? 'Dispatched for Delivery'
      : order.status === 'delivered'
      ? 'Delivered'
      : 'Cancelled';

  const message = `Salam ${order.customer_name},

This is AK Sports regarding your Cash on Delivery Order #${order.id}.

Order Summary:
${itemsSummary}
Subtotal: Rs. ${order.subtotal.toLocaleString()}
Delivery Fee: Rs. ${order.delivery_fee.toLocaleString()}
Total Payable: Rs. ${order.total.toLocaleString()} (Cash on Delivery)

Delivery Address:
${order.customer_address}, ${order.city}

Current Status: ${statusLabel}

Please reply with "CONFIRM" so our team can immediately dispatch your parcel. Thank you for choosing AK Sports!`;

  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Fetch all orders with their line items
 */
export async function getAdminOrders(): Promise<AdminOrder[]> {
  if (!isSupabaseConfigured() || !supabase) {
    // Local offline mock storage fallback
    const saved = localStorage.getItem('ak_sports_admin_mock_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fall through to default mock
      }
    }

    const defaultMockOrders: AdminOrder[] = [
      {
        id: 'AK-984210',
        customer_name: 'Usman Tariq',
        customer_phone: '0300-8451290',
        customer_address: 'House 42-B, Street 7, Phase 5, DHA',
        city: 'Lahore',
        subtotal: 5300,
        delivery_fee: 0,
        total: 5300,
        payment_method: 'cod',
        status: 'pending_cod',
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        items: [
          {
            order_id: 'AK-984210',
            product_id: 'ak-apparel-pro-trousers',
            product_name: 'AK Pro Matrix Flex Athletic Trousers',
            variant_title: 'M (31-33")',
            unit_price: 2650,
            quantity: 2,
            total_price: 5300,
          },
        ],
      },
      {
        id: 'AK-719342',
        customer_name: 'Hamza Malik',
        customer_phone: '0321-4901827',
        customer_address: 'Flat 304, Al-Ghafoor Heights, Block 13-D, Gulshan-e-Iqbal',
        city: 'Karachi',
        subtotal: 6800,
        delivery_fee: 0,
        total: 6800,
        payment_method: 'cod',
        status: 'processing',
        created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        items: [
          {
            order_id: 'AK-719342',
            product_id: 'ak-bat-gold-edition',
            product_name: 'AK Gold Edition Pro Handcrafted Bat',
            variant_title: '35.0" Standard (820g)',
            unit_price: 6800,
            quantity: 1,
            total_price: 6800,
          },
        ],
      },
      {
        id: 'AK-562189',
        customer_name: 'Bilal Ahmad',
        customer_phone: '0333-5129844',
        customer_address: 'Street 19, Sector F-8/2',
        city: 'Islamabad',
        subtotal: 4500,
        delivery_fee: 0,
        total: 4500,
        payment_method: 'cod',
        status: 'dispatched',
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        items: [
          {
            order_id: 'AK-562189',
            product_id: 'ak-apparel-oversized-tee',
            product_name: 'AK Forged Athletics Heavy-Cotton Training Tee',
            variant_title: 'Large',
            unit_price: 1850,
            quantity: 1,
            total_price: 1850,
          },
          {
            order_id: 'AK-562189',
            product_id: 'ak-apparel-pro-trousers',
            product_name: 'AK Pro Matrix Flex Athletic Trousers',
            variant_title: 'L (34-36")',
            unit_price: 2650,
            quantity: 1,
            total_price: 2650,
          },
        ],
      },
    ];

    localStorage.setItem('ak_sports_admin_mock_orders', JSON.stringify(defaultMockOrders));
    return defaultMockOrders;
  }

  try {
    const { data: dbOrders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (orderError || !dbOrders) {
      console.warn('[AK Sports Admin] Error loading orders from Supabase, checking local cache:', orderError);
      const localRaw = localStorage.getItem('ak_sports_admin_mock_orders');
      if (localRaw) {
        try {
          return JSON.parse(localRaw);
        } catch {
          return [];
        }
      }
      return [];
    }

    const { data: dbItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*');

    if (itemsError) {
      console.warn('[AK Sports Admin] Error loading order items:', itemsError);
    }

    const itemsByOrder: Record<string, AdminOrderItem[]> = {};
    (dbItems || []).forEach((item: any) => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }
      itemsByOrder[item.order_id].push({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        variant_title: item.variant_title,
        unit_price: item.unit_price,
        quantity: item.quantity,
        total_price: item.total_price,
      });
    });

    const parsedDbOrders: AdminOrder[] = dbOrders.map((o: any) => ({
      id: o.id,
      customer_name: o.customer_name,
      customer_phone: o.customer_phone,
      customer_address: o.customer_address,
      city: o.city,
      subtotal: o.subtotal,
      delivery_fee: o.delivery_fee,
      total: o.total,
      payment_method: o.payment_method,
      status: o.status,
      client_ip: o.client_ip,
      created_at: o.created_at,
      updated_at: o.updated_at,
      items: itemsByOrder[o.id] || [],
    }));

    // Merge any locally placed orders not yet in database
    const localRaw = localStorage.getItem('ak_sports_admin_mock_orders');
    if (localRaw) {
      try {
        const localOrders: AdminOrder[] = JSON.parse(localRaw);
        localOrders.forEach(lo => {
          if (!parsedDbOrders.some(p => p.id === lo.id)) {
            parsedDbOrders.push(lo);
          }
        });
      } catch (err) {
        console.warn('[AK Sports Admin] Error parsing local orders:', err);
      }
    }

    return parsedDbOrders;
  } catch (err: any) {
    console.error('[AK Sports Admin] Exception loading orders:', err);
    const localRaw = localStorage.getItem('ak_sports_admin_mock_orders');
    if (localRaw) {
      try {
        return JSON.parse(localRaw);
      } catch {}
    }
    return [];
  }
}

/**
 * Update an order's status (pending_cod, processing, dispatched, delivered, cancelled)
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    const orders = await getAdminOrders();
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    localStorage.setItem('ak_sports_admin_mock_orders', JSON.stringify(updated));
    return { success: true };
  }

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
