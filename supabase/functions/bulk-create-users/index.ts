import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin using their token
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Not admin" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { users, action } = await req.json();

    // Handle delete all action
    if (action === "delete_all") {
      // Get all non-admin users
      const { data: adminRoles } = await adminClient
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      const adminIds = (adminRoles || []).map((r: any) => r.user_id);

      const { data: allProfiles } = await adminClient
        .from("profiles")
        .select("user_id");
      
      let deleted = 0;
      for (const p of allProfiles || []) {
        if (adminIds.includes(p.user_id)) continue;
        // Delete related data
        await adminClient.from("ordenes").delete().eq("user_id", p.user_id);
        await adminClient.from("becas").delete().eq("user_id", p.user_id);
        await adminClient.from("beca_uso_mensual").delete().eq("user_id", p.user_id);
        await adminClient.from("turnos").delete().eq("user_id", p.user_id);
        await adminClient.from("pagos").delete().eq("user_id", p.user_id);
        await adminClient.from("profiles").delete().eq("user_id", p.user_id);
        await adminClient.from("user_roles").delete().eq("user_id", p.user_id);
        // Delete auth user
        await adminClient.auth.admin.deleteUser(p.user_id);
        deleted++;
      }

      return new Response(
        JSON.stringify({ success: true, deleted }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Bulk create users
    if (!Array.isArray(users) || users.length === 0) {
      return new Response(JSON.stringify({ error: "No users provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = { created: 0, skipped: 0, errors: [] as string[] };

    for (const u of users) {
      const { email, apellido, nombre, carrera, porcentaje_beca } = u;
      const dni = (u.dni || '').toString().trim().replace(/[,.\s]/g, '');

      if (!dni || !email) {
        results.errors.push(`Fila sin DNI o email: ${JSON.stringify(u)}`);
        results.skipped++;
        continue;
      }

      const nombreCompleto = `${apellido || ""} ${nombre || ""}`.trim();

      // Check if user already exists by email
      const { data: existingProfiles } = await adminClient
        .from("profiles")
        .select("user_id")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle();

      if (existingProfiles) {
        results.skipped++;
        continue;
      }

      // Check if DNI already exists
      const { data: existingDni } = await adminClient
        .from("profiles")
        .select("user_id")
        .eq("dni", dni.toString().trim())
        .maybeSingle();

      if (existingDni) {
        results.skipped++;
        continue;
      }

      // Create auth user with DNI as password, auto-confirm
      const { data: newUser, error: createError } =
        await adminClient.auth.admin.createUser({
          email: email.toLowerCase().trim(),
          password: dni.toString().trim(),
          email_confirm: true,
          user_metadata: {
            nombre_completo: nombreCompleto,
            dni: dni.toString().trim(),
            carrera: carrera || "",
          },
        });

      if (createError) {
        results.errors.push(`Error creando ${email}: ${createError.message}`);
        results.skipped++;
        continue;
      }

      // Create beca if percentage is 50 or 100
      let becaPct = parseFloat(porcentaje_beca?.toString() || "0");
      if (becaPct > 0 && becaPct <= 1) becaPct = Math.round(becaPct * 100); // 0.5 → 50, 1 → 100
      if (becaPct === 50 || becaPct === 100) {
        await adminClient.from("becas").insert({
          user_id: newUser.user.id,
          tipo: becaPct.toString() as any,
          estado: "aprobada" as any,
          fecha_inicio: new Date().toISOString().split("T")[0],
        });
      }

      results.created++;
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
