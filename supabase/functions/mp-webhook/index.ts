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
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");

    // MP sends notifications with topic=payment or type=payment
    if (topic !== "payment") {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const paymentId = body?.data?.id || url.searchParams.get("data.id");

    if (!paymentId) {
      return new Response(JSON.stringify({ error: "No payment ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpAccessToken) {
      return new Response(JSON.stringify({ error: "MP not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get payment details from MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpAccessToken}` },
    });
    const mpPayment = await mpRes.json();

    if (!mpRes.ok) {
      console.error("MP payment fetch error:", mpPayment);
      return new Response(JSON.stringify({ error: "Failed to fetch payment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const externalReference = mpPayment.external_reference;
    if (!externalReference) {
      return new Response(JSON.stringify({ ok: true, msg: "No external reference" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ordenIds = externalReference.split(",");

    if (mpPayment.status === "approved") {
      // Update pagos status
      await adminClient
        .from("pagos")
        .update({ estado: "aprobado", transaccion_id: String(paymentId) })
        .in("orden_id", ordenIds);

      // Update ordenes status to pagado (also recover orders that were
      // erroneously cancelled before the approved webhook arrived).
      await adminClient
        .from("ordenes")
        .update({ estado: "pagado" })
        .in("id", ordenIds)
        .in("estado", ["pendiente_pago", "cancelada"]);

      // Now update beca usage for orders that used beca
      const { data: ordenes } = await adminClient
        .from("ordenes")
        .select("*")
        .in("id", ordenIds);

      if (ordenes) {
        for (const orden of ordenes) {
          if (orden.usar_beca && orden.descuento_beca && orden.descuento_beca > 0) {
            // Calculate carillas con beca from the order data
            // carillas = cantidad_paginas, we need to figure out how many were covered by beca
            // We stored descuento_beca as money amount; we need carillas
            // Better approach: calculate from the order's price structure
            const carillas = orden.cantidad_paginas;
            const base = Number(orden.precio_base);
            const descuento = Number(orden.descuento_beca);
            const precioPorCarilla = base / carillas;
            const carillasConBeca = precioPorCarilla > 0 ? Math.round(descuento / precioPorCarilla) : 0;

            if (carillasConBeca > 0) {
              const now = new Date();
              const mes = now.getMonth() + 1;
              const anio = now.getFullYear();

              const { data: existing } = await adminClient
                .from("beca_uso_mensual")
                .select("*")
                .eq("user_id", orden.user_id)
                .eq("mes", mes)
                .eq("anio", anio)
                .maybeSingle();

              if (existing) {
                await adminClient.from("beca_uso_mensual").update({
                  monto_usado: Number(existing.monto_usado || 0) + carillasConBeca,
                }).eq("id", existing.id);
              } else {
                await adminClient.from("beca_uso_mensual").insert({
                  user_id: orden.user_id,
                  mes,
                  anio,
                  monto_usado: carillasConBeca,
                });
              }
            }
          }
        }
      }

      console.log(`Payment ${paymentId} approved. Orders updated:`, ordenIds);
    } else if (mpPayment.status === "rejected") {
      await adminClient
        .from("pagos")
        .update({ estado: "rechazado", transaccion_id: String(paymentId) })
        .in("orden_id", ordenIds);

      // Cancel orders
      await adminClient
        .from("ordenes")
        .update({ estado: "cancelada" })
        .in("id", ordenIds)
        .eq("estado", "pendiente_pago");

      console.log(`Payment ${paymentId} rejected. Orders cancelled:`, ordenIds);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
