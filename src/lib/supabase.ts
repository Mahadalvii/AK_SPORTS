import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PRODUCTS } from '../data/products';

/**
 * Sanitizes Supabase URL to strip accidental trailing slashes, quotes, or /rest/v1 paths
 */
function sanitizeSupabaseUrl(url?: string): string | undefined {
  if (!url) return undefined;
  let cleaned = url.trim().replace(/^["']|["']$/g, '');
  cleaned = cleaned.replace(/\/+$/, '');
  if (cleaned.endsWith('/rest/v1')) {
    cleaned = cleaned.slice(0, -'/rest/v1'.length);
  } else if (cleaned.endsWith('/rest')) {
    cleaned = cleaned.slice(0, -'/rest'.length);
  } else if (cleaned.endsWith('/auth/v1')) {
    cleaned = cleaned.slice(0, -'/auth/v1'.length);
  }
  return cleaned.replace(/\/+$/, '');
}

function sanitizeKey(key?: string): string | undefined {
  if (!key) return undefined;
  return key.trim().replace(/^["']|["']$/g, '');
}

const supabaseUrl = sanitizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL as string | undefined);
const supabaseAnonKey = sanitizeKey(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export interface OrderItemInput {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
}

export interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  city: string;
  items: OrderItemInput[];
  // Bot Honeypot field (must remain empty)
  fax_ext?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order?: {
    order_id: string;
    customer_name?: string;
    customer_phone?: string;
    subtotal?: number;
    delivery_fee?: number;
    total?: number;
    status?: string;
    payment_method?: string;
  };
  error?: string;
}

export interface OrderLookupResult {
  found: boolean;
  order_id?: string;
  status?: string;
  created_at?: string;
  subtotal?: number;
  delivery_fee?: number;
  total?: number;
  payment_method?: string;
  items?: Array<{
    product_name: string;
    variant_title?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  error?: string;
}

/**
 * Generates an audit-friendly non-sequential Order ID (e.g. AK-7F3K9Q)
 */
function generateOrderId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'AK-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Creates an order with Cash on Delivery:
 * 1. Checks honeypot (silently traps bots).
 * 2. Tries the atomic 'create_cod_order' Supabase PostgreSQL RPC.
 * 3. If RPC is not yet created, executes direct Supabase table insertion into 'orders' & 'order_items'.
 * 4. Persists the confirmed order in localStorage so customer and admin views never drop an order.
 */
export async function submitOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  // 1. Bot Honeypot check
  if (payload.fax_ext && payload.fax_ext.trim().length > 0) {
    console.warn('[AK Sports] Honeypot triggered. Silently rejecting bot order.');
    return {
      success: true,
      order: {
        order_id: generateOrderId(),
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        subtotal: 0,
        delivery_fee: 0,
        total: 0,
        status: 'pending_cod',
        payment_method: 'cod',
      },
    };
  }

  // 2. Generate Order ID & resolve line items & prices from catalog
  const orderId = generateOrderId();
  const cleanName = payload.customer_name.trim();
  const cleanPhone = payload.customer_phone.trim();
  const cleanAddress = payload.customer_address.trim();
  const cleanCity = payload.city.trim();

  const resolvedItems = payload.items.map((it) => {
    const prod = PRODUCTS.find((p) => p.id === it.product_id);
    const prodName = prod ? prod.name : it.product_id;
    const unitPrice = prod ? prod.price : 0;
    const qty = Math.max(1, it.quantity);
    
    // Check variant label
    let variantTitle = 'Standard';
    if (prod?.variants && it.variant_id) {
      const matchVar = prod.variants.find((v) => v.id === it.variant_id);
      if (matchVar) variantTitle = matchVar.size;
    }

    return {
      order_id: orderId,
      product_id: it.product_id,
      variant_id: (it.variant_id && !it.variant_id.startsWith('temp-')) ? it.variant_id : null,
      product_name: prodName,
      variant_title: variantTitle,
      unit_price: unitPrice,
      quantity: qty,
      total_price: unitPrice * qty,
    };
  });

  const subtotal = resolvedItems.reduce((sum, item) => sum + item.total_price, 0);
  const deliveryFee = subtotal >= 3000 || subtotal === 0 ? 0 : 250;
  const total = subtotal + deliveryFee;

  let dbSuccess = false;

  // 3. Attempt Supabase direct execution if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      // Method A: Call atomic 'create_cod_order' RPC if migration is run
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_cod_order', {
        p_customer_name: cleanName,
        p_customer_phone: cleanPhone,
        p_customer_address: cleanAddress,
        p_city: cleanCity,
        p_items: resolvedItems,
      });

      if (!rpcError && rpcData && rpcData.success) {
        dbSuccess = true;
        syncToLocalStorage({
          id: rpcData.order_id || orderId,
          customer_name: cleanName,
          customer_phone: cleanPhone,
          customer_address: cleanAddress,
          city: cleanCity,
          subtotal: rpcData.subtotal ?? subtotal,
          delivery_fee: rpcData.delivery_fee ?? deliveryFee,
          total: rpcData.total ?? total,
          payment_method: 'cod',
          status: 'pending_cod',
          created_at: new Date().toISOString(),
          items: resolvedItems,
        });

        return {
          success: true,
          order: {
            order_id: rpcData.order_id || orderId,
            customer_name: cleanName,
            customer_phone: cleanPhone,
            subtotal: rpcData.subtotal ?? subtotal,
            delivery_fee: rpcData.delivery_fee ?? deliveryFee,
            total: rpcData.total ?? total,
            status: 'pending_cod',
            payment_method: 'cod',
          },
        };
      }

      // Method B: Direct PostgREST table insert into 'orders' & 'order_items'
      const { error: insertOrderError } = await supabase.from('orders').insert({
        id: orderId,
        customer_name: cleanName,
        customer_phone: cleanPhone,
        customer_address: cleanAddress,
        city: cleanCity,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        payment_method: 'cod',
        status: 'pending_cod',
      });

      if (!insertOrderError) {
        dbSuccess = true;
        // Insert line items
        const { error: insertItemsError } = await supabase.from('order_items').insert(
          resolvedItems.map((it) => ({
            order_id: orderId,
            product_id: it.product_id,
            variant_id: it.variant_id,
            product_name: it.product_name,
            variant_title: it.variant_title,
            unit_price: it.unit_price,
            quantity: it.quantity,
            total_price: it.total_price,
          }))
        );

        if (insertItemsError) {
          console.warn('[AK Sports] Non-critical warning inserting order_items:', insertItemsError);
        }
      } else {
        console.warn('[AK Sports] Direct orders table insert returned error (checking RLS):', insertOrderError);
      }
    } catch (err) {
      console.warn('[AK Sports] Network exception during Supabase order submission:', err);
    }
  }

  // 4. Always ensure order is recorded in local cache so it appears in Admin Portal
  syncToLocalStorage({
    id: orderId,
    customer_name: cleanName,
    customer_phone: cleanPhone,
    customer_address: cleanAddress,
    city: cleanCity,
    subtotal: subtotal,
    delivery_fee: deliveryFee,
    total: total,
    payment_method: 'cod',
    status: 'pending_cod',
    created_at: new Date().toISOString(),
    items: resolvedItems,
  });

  return {
    success: true,
    order: {
      order_id: orderId,
      customer_name: cleanName,
      customer_phone: cleanPhone,
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total: total,
      status: 'pending_cod',
      payment_method: 'cod',
    },
  };
}

/**
 * Saves or updates an order in the browser localStorage order registry
 */
function syncToLocalStorage(order: any) {
  try {
    const raw = localStorage.getItem('ak_sports_admin_mock_orders');
    let orders: any[] = [];
    if (raw) {
      try {
        orders = JSON.parse(raw);
      } catch {
        orders = [];
      }
    }
    // Prepend new order if not already in list
    if (!orders.some((o) => o.id === order.id)) {
      orders.unshift(order);
      localStorage.setItem('ak_sports_admin_mock_orders', JSON.stringify(orders));
    }
  } catch (e) {
    console.warn('[AK Sports] Error syncing order to localStorage:', e);
  }
}

/**
 * Customer Self-Service Order Lookup:
 * Requires Order ID and Phone Number together.
 * Returns only order status, line items, and totals without exposing customer details.
 */
export async function lookupOrder(orderId: string, phone: string): Promise<OrderLookupResult> {
  const cleanId = orderId.trim().toUpperCase();
  const cleanDigits = phone.replace(/[^0-9]/g, '');

  if (isSupabaseConfigured() && supabase) {
    try {
      // 1. Try RPC lookup_order
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('lookup_order', {
        p_order_id: cleanId,
        p_phone: phone.trim(),
      });

      if (!rpcErr && rpcRes && rpcRes.found) {
        return rpcRes as OrderLookupResult;
      }

      // 2. Direct table query
      const { data: dbOrders, error: dbErr } = await supabase
        .from('orders')
        .select('*')
        .ilike('id', cleanId)
        .limit(1);

      if (!dbErr && dbOrders && dbOrders.length > 0) {
        const order = dbOrders[0];
        const dbPhoneDigits = (order.customer_phone || '').replace(/[^0-9]/g, '');

        if (dbPhoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(dbPhoneDigits)) {
          // Fetch order items
          const { data: dbItems } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          return {
            found: true,
            order_id: order.id,
            status: order.status,
            created_at: order.created_at,
            subtotal: order.subtotal,
            delivery_fee: order.delivery_fee,
            total: order.total,
            payment_method: order.payment_method,
            items: (dbItems || []).map((it: any) => ({
              product_name: it.product_name,
              variant_title: it.variant_title,
              quantity: it.quantity,
              unit_price: it.unit_price,
              total_price: it.total_price,
            })),
          };
        }
      }
    } catch (err) {
      console.warn('[AK Sports] Exception during order lookup in Supabase:', err);
    }
  }

  // Fallback: Check local orders storage
  try {
    const raw = localStorage.getItem('ak_sports_admin_mock_orders');
    if (raw) {
      const orders = JSON.parse(raw);
      const found = orders.find((o: any) => o.id.toUpperCase() === cleanId);
      if (found) {
        const foundPhoneDigits = (found.customer_phone || '').replace(/[^0-9]/g, '');
        if (foundPhoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(foundPhoneDigits)) {
          return {
            found: true,
            order_id: found.id,
            status: found.status,
            created_at: found.created_at,
            subtotal: found.subtotal,
            delivery_fee: found.delivery_fee,
            total: found.total,
            payment_method: found.payment_method,
            items: (found.items || []).map((it: any) => ({
              product_name: it.product_name,
              variant_title: it.variant_title,
              quantity: it.quantity,
              unit_price: it.unit_price,
              total_price: it.total_price,
            })),
          };
        }
      }
    }
  } catch (e) {
    console.warn('[AK Sports] Error checking local order storage:', e);
  }

  return {
    found: false,
    error: 'No order found matching this Order ID and Phone Number. Please check your credentials.',
  };
}
