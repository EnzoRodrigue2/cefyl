import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");

    if (!mpAccessToken) {
      return new Response(JSON.stringify({ error: "Mercado Pago no configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await callerClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { orden_ids, back_url } = await req.json();

    if (!orden_ids || !Array.isArray(orden_ids) || orden_ids.length === 0) {
      return new Response(JSON.stringify({ error: "No order IDs provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get orders
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: ordenes, error: ordError } = await adminClient
      .from("ordenes")
      .select("*")
      .in("id", orden_ids)
      .eq("user_id", user.id);

    if (ordError || !ordenes || ordenes.length === 0) {
      return new Response(JSON.stringify({ error: "Orders not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile
    const { data: profile } = await adminClient
      .from("profiles")
      .select("nombre_completo, email")
      .eq("user_id", user.id)
      .single();

    const items = ordenes.map((o: any) => ({
      title: `Impresión: ${o.archivo_nombre}`,
      description: `${o.cantidad_paginas} carillas · ${o.cantidad_hojas} hojas${o.doble_faz ? ' · Doble faz' : ' · Simple faz'}${o.color ? ' · Color' : ''}${o.anillado ? ' · Anillado' : ''}`,
      quantity: 1,
      currency_id: "ARS",
      unit_price: Number(o.monto_final),
    }));

    const totalAmount = ordenes.reduce((s: number, o: any) => s + Number(o.monto_final), 0);

    // Create MP preference
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify({
        items,
        payer: {
          name: profile?.nombre_completo || "",
          email: profile?.email || user.email || "",
        },
        back_urls: {
          success: back_url || `${supabaseUrl}`,
          failure: back_url || `${supabaseUrl}`,
          pending: back_url || `${supabaseUrl}`,
        },
        notification_url: `${supabaseUrl}/functions/v1/mp-webhook?topic=payment`,
        auto_return: "approved",
        external_reference: orden_ids.join(","),
        statement_descriptor: "IMPRESIONES CEFYL",
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("MP error:", mpData);
      return new Response(JSON.stringify({ error: "Error creating MP preference", details: mpData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create pago records
    for (const o of ordenes) {
      await adminClient.from("pagos").insert({
        user_id: user.id,
        orden_id: o.id,
        monto: Number(o.monto_final),
        metodo: "mercadopago",
        estado: "pendiente",
        transaccion_id: mpData.id,
      });
    }

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
        preference_id: mpData.id,
        total: totalAmount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
