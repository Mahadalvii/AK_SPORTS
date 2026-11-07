// ============================================================================
// AK SPORTS: SUPABASE EDGE FUNCTION (create-order)
// Runtime: Deno (Supabase Edge Functions)
// ============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// CORS Configuration (Comma-separated ALLOWED_ORIGIN, trimmed, exact match; no wildcards)
function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowedOriginEnv = Deno.env.get("ALLOWED_ORIGIN") || "";
  const envOrigins = allowedOriginEnv
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
  const testOrigins = ["http://localhost:3000", "http://localhost:5173"];
  const allowedList = [...envOrigins, ...testOrigins];

  const isAllowed = allowedList.includes(origin);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };

  if (isAllowed && origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

// Generate realistic non-sequential ID for honeypot bot trap
function generateFakeOrderId(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let result = "AK-";
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// UUID validation regex (8-4-4-4-12 hex)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Pakistani mobile regex: 03XX-XXXXXXX or 03XXXXXXXXX
const PHONE_REGEX = /^03[0-9]{2}-?[0-9]{7}$/;

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 1. Initialize Supabase Admin Client using Service Role Key
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[create-order] Missing internal server environment keys.");
    return new Response(
      JSON.stringify({ error: "Something went wrong, please try again or message us on WhatsApp." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  // Helper for database rate limiting (fails closed on error)
  async function checkRateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
        p_key: key,
        p_max: max,
        p_window_seconds: windowSeconds,
      });

      if (error) {
        console.error("[create-order rate-limit error]", error.code);
        return false; // Fail closed
      }

      return Boolean(data);
    } catch (e: any) {
      console.error("[create-order rate-limit exception]", e?.message || "unknown");
      return false; // Fail closed
    }
  }

  try {
    // 2. Client IP: Trust ONLY cf-connecting-ip. If missing, use "unknown".
    const clientIp = req.headers.get("cf-connecting-ip")?.trim() || "unknown";

    // Rate Limit 1: IP limit checked FIRST (10 per 3600 seconds)
    const ipAllowed = await checkRateLimit(`create-order:ip:${clientIp}`, 10, 3600);
    if (!ipAllowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests from your network. Please wait a while or contact us on WhatsApp." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Body JSON Validation
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid JSON request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Honeypot: Check single field fax_ext only. Return fake success without creating anything.
    if (body.fax_ext) {
      console.warn("[create-order] Honeypot triggered from IP:", clientIp);
      return new Response(
        JSON.stringify({
          success: true,
          order: {
            order_id: generateFakeOrderId(),
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { customer_name, customer_phone, customer_address, city, items } = body;

    // 5. Pre-Database Input Validation
    // Name validation (max 100)
    if (!customer_name || typeof customer_name !== "string" || customer_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Customer name is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (customer_name.trim().length > 100) {
      return new Response(
        JSON.stringify({ error: "Customer name cannot exceed 100 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Phone validation
    const rawPhone = customer_phone?.toString()?.trim() || "";
    if (!PHONE_REGEX.test(rawPhone)) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid Pakistani mobile number in the format 03XX-XXXXXXX." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const digitsOnly = rawPhone.replace(/[^0-9]/g, "");
    const formattedPhone = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4)}`;

    // Address validation (max 300)
    if (!customer_address || typeof customer_address !== "string" || customer_address.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Delivery address is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (customer_address.trim().length > 300) {
      return new Response(
        JSON.stringify({ error: "Delivery address cannot exceed 300 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // City validation (max 60)
    if (!city || typeof city !== "string" || city.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "City is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (city.trim().length > 60) {
      return new Response(
        JSON.stringify({ error: "City cannot exceed 60 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Items validation (1 to 20 lines)
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Order must contain at least one item." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (items.length > 20) {
      return new Response(
        JSON.stringify({ error: "Order cannot contain more than 20 items." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Validate items & merge duplicate variants into one line
    const variantMap = new Map<string, { product_id: string; variant_id: string; quantity: number }>();

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || typeof it !== "object") {
        return new Response(
          JSON.stringify({ error: "Invalid item payload in bag." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const prodId = typeof it.product_id === "string" ? it.product_id.trim() : "";
      if (!prodId) {
        return new Response(
          JSON.stringify({ error: "Every item must have a valid product ID." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const varId = typeof it.variant_id === "string" ? it.variant_id.trim() : "";
      if (!varId || !UUID_REGEX.test(varId)) {
        return new Response(
          JSON.stringify({ error: "Every item must have a valid size/variant selected." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Quantity must be an integer from 1 to 10 (reject, do not clamp)
      const qty = it.quantity;
      if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
        return new Response(
          JSON.stringify({ error: "Quantity for each line must be a whole number between 1 and 10." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Merge duplicate variants
      const existing = variantMap.get(varId);
      if (existing) {
        const totalVariantQty = existing.quantity + qty;
        if (totalVariantQty > 10) {
          return new Response(
            JSON.stringify({ error: "Total quantity for any individual size cannot exceed 10 units." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        existing.quantity = totalVariantQty;
      } else {
        variantMap.set(varId, {
          product_id: prodId,
          variant_id: varId,
          quantity: qty,
        });
      }
    }

    const mergedItems = Array.from(variantMap.values());

    // 7. Deduplication Check (2 minutes): Match only if phone, name, address, and all items are identical
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: recentOrders, error: recentError } = await supabaseAdmin
      .from("orders")
      .select("id, customer_name, customer_phone, customer_address, subtotal, delivery_fee, total, status, payment_method, order_items(product_id, variant_id, quantity)")
      .eq("customer_phone", formattedPhone)
      .gte("created_at", twoMinutesAgo)
      .order("created_at", { ascending: false });

    if (!recentError && recentOrders && recentOrders.length > 0) {
      for (const ro of recentOrders) {
        const isNameMatch = ro.customer_name.trim().toLowerCase() === customer_name.trim().toLowerCase();
        const isAddressMatch = ro.customer_address.trim().toLowerCase() === customer_address.trim().toLowerCase();

        if (isNameMatch && isAddressMatch) {
          const roItems = (ro.order_items || []) as Array<{ product_id: string; variant_id: string; quantity: number }>;
          
          if (roItems.length === mergedItems.length) {
            const isItemsMatch = mergedItems.every((mi) => 
              roItems.some((roi) => roi.variant_id === mi.variant_id && roi.quantity === mi.quantity)
            );

            if (isItemsMatch) {
              console.warn("[create-order] Deduplication match found: Returning previous confirmation.");
              return new Response(
                JSON.stringify({
                  success: true,
                  order: {
                    order_id: ro.id,
                    subtotal: ro.subtotal,
                    delivery_fee: ro.delivery_fee,
                    total: ro.total,
                    status: ro.status,
                    payment_method: ro.payment_method,
                  },
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        }
      }
    }

    // 8. Rate Limits Applied Right Before create_order (After Validation & Dedup)
    // Phone limit: max 3 per 3600 seconds
    const phoneAllowed = await checkRateLimit(`create-order:phone:${digitsOnly}`, 3, 3600);
    if (!phoneAllowed) {
      return new Response(
        JSON.stringify({ error: "Too many order attempts for this mobile number. Please message us directly on WhatsApp." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Global limit: max 300 per 3600 seconds
    const globalAllowed = await checkRateLimit("create-order:global", 300, 3600);
    if (!globalAllowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a while or contact us on WhatsApp." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 9. Execute Atomic create_order RPC
    const { data, error: rpcError } = await supabaseAdmin.rpc("create_order", {
      p_customer_name: customer_name.trim(),
      p_customer_phone: formattedPhone,
      p_customer_address: customer_address.trim(),
      p_city: city.trim(),
      p_items: mergedItems,
      p_client_ip: clientIp,
    });

    if (rpcError) {
      // Log sanitized server-side error without customer PII
      console.error("[create-order RPC Error]", rpcError.code, rpcError.message);

      const errLower = (rpcError.message || "").toLowerCase();
      let userFacingError = "Something went wrong, please try again or message us on WhatsApp.";

      if (errLower.includes("stock") || errLower.includes("insufficient")) {
        userFacingError = "One or more items in your bag are out of stock. Please adjust quantities or select another size.";
      } else if (errLower.includes("active") || errLower.includes("unavailable") || errLower.includes("not found")) {
        userFacingError = "One or more items in your bag are currently unavailable.";
      } else if (errLower.includes("phone")) {
        userFacingError = "Please enter a valid Pakistani mobile number in the format 03XX-XXXXXXX.";
      }

      return new Response(
        JSON.stringify({ error: userFacingError }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 10. Return Successful Order Confirmation (Without name or phone, matching dedup shape)
    return new Response(
      JSON.stringify({
        success: true,
        order: {
          order_id: data.order_id,
          subtotal: data.subtotal,
          delivery_fee: data.delivery_fee,
          total: data.total,
          status: data.status,
          payment_method: data.payment_method,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    // Log unexpected errors server-side without leaking raw messages or customer PII
    console.error("[create-order Unhandled Exception]", err?.name || "Error");

    return new Response(
      JSON.stringify({ error: "Something went wrong, please try again or message us on WhatsApp." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
