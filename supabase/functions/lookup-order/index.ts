// ============================================================================
// AK SPORTS: SUPABASE EDGE FUNCTION (lookup-order)
// Runtime: Deno (Supabase Edge Functions)
// Enforces database rate limiting (max 20 per hour per IP), validates input,
// and invokes service_role lookup_order RPC returning sanitized order details.
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

// Order ID regex: AK- followed by 6 alphanumeric characters
const ORDER_ID_REGEX = /^AK-[A-Z0-9]{6}$/i;
// Phone regex: must contain at least 10-11 digits
const PHONE_DIGITS_REGEX = /^[0-9]{10,12}$/;

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
    console.error("[lookup-order] Missing internal server environment keys.");
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
        console.error("[lookup-order rate-limit error]", error.code);
        return false; // Fail closed
      }

      return Boolean(data);
    } catch (e: any) {
      console.error("[lookup-order rate-limit exception]", e?.message || "unknown");
      return false; // Fail closed
    }
  }

  try {
    // 2. Client IP: Trust ONLY cf-connecting-ip. If missing, use "unknown".
    const clientIp = req.headers.get("cf-connecting-ip")?.trim() || "unknown";

    const ipAllowed = await checkRateLimit(`lookup-order:ip:${clientIp}`, 20, 3600);
    if (!ipAllowed) {
      return new Response(
        JSON.stringify({ error: "Too many tracking attempts from your network. Please wait a while or contact us on WhatsApp." }),
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

    const { order_id, phone } = body;

    // 4. Validate Order ID (Format: AK-XXXXXX)
    const rawOrderId = typeof order_id === "string" ? order_id.trim().toUpperCase() : "";
    if (!rawOrderId || !ORDER_ID_REGEX.test(rawOrderId)) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid Order ID in the format AK-XXXXXX." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Validate Phone Number
    const rawPhone = typeof phone === "string" ? phone.trim() : (phone?.toString()?.trim() || "");
    const cleanDigits = rawPhone.replace(/[^0-9]/g, "");
    if (!cleanDigits || !PHONE_DIGITS_REGEX.test(cleanDigits)) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid phone number associated with the order." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Invoke service_role lookup_order RPC
    const { data, error: rpcError } = await supabaseAdmin.rpc("lookup_order", {
      p_order_id: rawOrderId,
      p_phone: cleanDigits,
    });

    if (rpcError) {
      // Log sanitized server-side error (without customer details)
      console.error("[lookup-order RPC Error]", rpcError.code, rpcError.message);

      return new Response(
        JSON.stringify({ error: "Something went wrong, please try again or message us on WhatsApp." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7. Return Result Unchanged
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    // Log unexpected errors server-side without leaking raw messages or customer PII
    console.error("[lookup-order Unhandled Exception]", err?.name || "Error");

    return new Response(
      JSON.stringify({ error: "Something went wrong, please try again or message us on WhatsApp." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
