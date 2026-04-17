// Sends a "your order is ready" email to the user when admin marks order as "hecho".
// Uses Lovable Email API. Requires an email domain configured in Lovable Cloud.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { orden_id } = await req.json();
    if (!orden_id) {
      return new Response(JSON.stringify({ error: "orden_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Fetch order
    const { data: orden, error: ordenErr } = await admin
      .from("ordenes")
      .select("id, user_id, archivo_nombre, email_retiro_enviado")
      .eq("id", orden_id)
      .single();

    if (ordenErr || !orden) {
      return new Response(JSON.stringify({ error: "Orden no encontrada" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (orden.email_retiro_enviado) {
      return new Response(JSON.stringify({ ok: true, skipped: "already_sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user email from profiles
    const { data: profile } = await admin
      .from("profiles")
      .select("email, nombre_completo")
      .eq("user_id", orden.user_id)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "Usuario sin email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to send via Lovable Email (requires configured domain)
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    let emailSent = false;
    let emailError: string | null = null;

    if (lovableApiKey) {
      try {
        const subject = "Tu pedido de impresión está listo para retirar 📚";
        const html = `
          <!doctype html>
          <html><body style="font-family: Arial, sans-serif; background:#fff; padding:20px;">
            <div style="max-width:560px; margin:0 auto; padding:24px; border:1px solid #e5e7eb; border-radius:12px;">
              <h2 style="color:#16a34a; margin:0 0 12px;">¡Hola ${profile.nombre_completo?.split(" ")[0] || ""}! 👋</h2>
              <p style="color:#111; font-size:15px;">Tu pedido de impresión <strong>ya está disponible para retirar</strong> en CEFyL.</p>
              <p style="color:#374151; font-size:14px;">Pedido: <em>${orden.archivo_nombre}</em></p>
              <p style="color:#6b7280; font-size:13px; margin-top:24px;">Pasá a buscarlo en horario del centro. ¡Gracias por usar el sistema! 🌱</p>
              <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />
              <p style="color:#9ca3af; font-size:12px;">IMPRESIONES CEFyL</p>
            </div>
          </body></html>
        `;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/email/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: profile.email,
            subject,
            html,
          }),
        });

        if (res.ok) {
          emailSent = true;
        } else {
          emailError = `Email API status ${res.status}: ${await res.text().catch(() => "")}`;
          console.warn(emailError);
        }
      } catch (err) {
        emailError = (err as Error).message;
        console.error("Email send failed:", err);
      }
    } else {
      emailError = "LOVABLE_API_KEY not configured";
    }

    // Mark as sent regardless to avoid retry storms; log the attempt
    await admin.from("ordenes").update({ email_retiro_enviado: true }).eq("id", orden_id);
    await admin.from("logs").insert({
      user_id: orden.user_id,
      accion: emailSent ? "email_retiro_enviado" : "email_retiro_intento_fallido",
      detalle: { orden_id, email: profile.email, error: emailError },
    });

    return new Response(JSON.stringify({ ok: true, sent: emailSent, error: emailError }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-pickup-notification error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
