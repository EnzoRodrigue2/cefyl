import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-import-token",
};

const TOKEN = "b3ca5-imp0rt-2026-08-26";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.headers.get("x-import-token") !== TOKEN) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { users } = await req.json();
  const results = { created: 0, repaired: 0, skipped: 0, errors: [] as string[] };

  for (const u of users ?? []) {
    const dni = String(u.dni).trim();
    const email = String(u.email).trim().toLowerCase();
    const nombreCompleto = `${u.apellido} ${u.nombre}`.trim();
    try {
      let userId: string | null = null;

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password: dni,
        email_confirm: true,
        user_metadata: { nombre_completo: nombreCompleto, dni, carrera: u.carrera },
      });

      if (created?.user) {
        userId = created.user.id;
        results.created++;
      } else {
        // email already exists -> find it
        for (let page = 1; page <= 10 && !userId; page++) {
          const { data } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
          const list = data?.users || [];
          const found = list.find((x: any) => String(x.email || "").toLowerCase() === email);
          if (found) userId = found.id;
          if (list.length < 1000) break;
        }
        if (!userId) {
          results.errors.push(`${email}: ${createErr?.message || "no se pudo crear"}`);
          continue;
        }
        await admin.auth.admin.updateUserById(userId, { password: dni });
        results.repaired++;
      }

      const { data: prof } = await admin.from("profiles").select("id").eq("user_id", userId).maybeSingle();
      if (!prof) {
        await admin.from("profiles").insert({
          user_id: userId,
          nombre_completo: nombreCompleto,
          dni,
          email,
          carrera: String(u.carrera || ""),
        });
      }

      const { data: role } = await admin.from("user_roles").select("id").eq("user_id", userId).maybeSingle();
      if (!role) await admin.from("user_roles").insert({ user_id: userId, role: "student" });

      const { data: beca } = await admin
        .from("becas").select("id").eq("user_id", userId).eq("estado", "aprobada").maybeSingle();
      if (!beca) {
        await admin.from("becas").insert({
          user_id: userId,
          tipo: String(u.porcentaje_beca),
          estado: "aprobada",
          fecha_inicio: new Date().toISOString().split("T")[0],
        });
      }
    } catch (e) {
      results.errors.push(`${email}: ${(e as Error).message}`);
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
