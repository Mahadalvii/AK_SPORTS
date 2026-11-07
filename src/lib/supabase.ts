import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

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
 * Creates an order by calling the secure Supabase Edge Function 'create-order'.
 * The Edge Function enforces IP rate-limiting, honeypot checks, and executes
 * the atomic 'create_order' PostgreSQL RPC with service_role privileges.
 */
export async function submitOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  if (!isSupabaseConfigured()) {
    // Graceful offline fallback simulation when Supabase credentials are not yet added
    console.warn('[AK Sports] Supabase credentials not set in .env. Falling back to offline confirmation.');
    const simulatedOrderId = `AK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      order: {
        order_id: simulatedOrderId,
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

  try {
    const edgeFunctionEndpoint = `${supabaseUrl}/functions/v1/create-order`;

    const res = await fetch(edgeFunctionEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey!,
        Authorization: `Bearer ${supabaseAnonKey!}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Failed to submit order. Please try again.',
      };
    }

    return {
      success: true,
      order: data.order,
    };
  } catch (err: any) {
    console.error('[AK Sports] Error calling create-order Edge Function:', err);
    return {
      success: false,
      error: err.message || 'Network error communicating with order server.',
    };
  }
}

/**
 * Customer Self-Service Order Lookup:
 * Requires Order ID and Phone Number together.
 * Returns only order status, line items, and totals without exposing customer details.
 */
export async function lookupOrder(orderId: string, phone: string): Promise<OrderLookupResult> {
  if (!isSupabaseConfigured()) {
    return {
      found: false,
      error: 'Order lookup service is currently connecting to Supabase database. Please check back shortly.',
    };
  }

  try {
    const edgeFunctionEndpoint = `${supabaseUrl}/functions/v1/lookup-order`;

    const res = await fetch(edgeFunctionEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey!,
        Authorization: `Bearer ${supabaseAnonKey!}`,
      },
      body: JSON.stringify({
        order_id: orderId.trim(),
        phone: phone.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        found: false,
        error: data.error || 'Failed to retrieve order details.',
      };
    }

    return data as OrderLookupResult;
  } catch (err: any) {
    console.error('[AK Sports] Order lookup network error:', err);
    return {
      found: false,
      error: 'Network error querying order status.',
    };
  }
}
