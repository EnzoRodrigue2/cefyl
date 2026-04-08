import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const normalizeDni = (value: unknown) =>
  String(value ?? "").trim().replace(/[,.\s]/g, "");

const normalizeEmail = (value: unknown) =>
  String(value ?? "").trim().toLowerCase();

const parseBecaPercentage = (value: unknown) => {
  const raw = String(value ?? "").trim().replace(/%+/g, "").replace(",", ".");
  let becaPct = parseFloat(raw) || 0;
  if (becaPct > 0 && becaPct <= 1) becaPct = Math.round(becaPct * 100);
  if (Math.abs(becaPct - 100) < 1) return 100;
  if (Math.abs(becaPct - 50) < 1) return 50;
  return 0;
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

    const callerClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || serviceRoleKey,
      { global: { headers: { Authorization: authHeader } } }
    );
    const {
      data: { user: caller },
    } = await callerClient.auth.getUser();

    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    if (action === "delete_all") {
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
        await adminClient.from("ordenes").delete().eq("user_id", p.user_id);
        await adminClient.from("becas").delete().eq("user_id", p.user_id);
        await adminClient.from("beca_uso_mensual").delete().eq("user_id", p.user_id);
        await adminClient.from("turnos").delete().eq("user_id", p.user_id);
        await adminClient.from("pagos").delete().eq("user_id", p.user_id);
        await adminClient.from("profiles").delete().eq("user_id", p.user_id);
        await adminClient.from("user_roles").delete().eq("user_id", p.user_id);
        await adminClient.auth.admin.deleteUser(p.user_id);
        deleted++;
      }

      return new Response(JSON.stringify({ success: true, deleted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(users) || users.length === 0) {
      return new Response(JSON.stringify({ error: "No users provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = { created: 0, skipped: 0, errors: [] as string[] };
    const uniqueUsers = [] as Array<{
      email: string;
      apellido: string;
      nombre: string;
      carrera: string;
      dni: string;
      porcentaje_beca: number;
    }>;
    const seenDnis = new Set<string>();
    const seenEmails = new Set<string>();

    for (const rawUser of users) {
      const email = normalizeEmail(rawUser.email);
      const dni = normalizeDni(rawUser.dni);

      if (!dni || !email) {
        results.errors.push(`Fila sin DNI o email: ${JSON.stringify(rawUser)}`);
        results.skipped++;
        continue;
      }

      if (seenDnis.has(dni) || seenEmails.has(email)) {
        results.skipped++;
        continue;
      }

      seenDnis.add(dni);
      seenEmails.add(email);
      uniqueUsers.push({
        email,
        dni,
        apellido: String(rawUser.apellido || "").trim(),
        nombre: String(rawUser.nombre || "").trim(),
        carrera: String(rawUser.carrera || "").trim(),
        porcentaje_beca: parseBecaPercentage(rawUser.porcentaje_beca),
      });
    }

    const emails = uniqueUsers.map((user) => user.email);
    const dnis = uniqueUsers.map((user) => user.dni);

    const [existingEmailsRes, existingDnisRes] = await Promise.all([
      emails.length
        ? adminClient.from("profiles").select("email").in("email", emails)
        : Promise.resolve({ data: [], error: null }),
      dnis.length
        ? adminClient.from("profiles").select("dni").in("dni", dnis)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (existingEmailsRes.error) throw existingEmailsRes.error;
    if (existingDnisRes.error) throw existingDnisRes.error;

    const existingEmails = new Set(
      (existingEmailsRes.data || []).map((profile: any) => normalizeEmail(profile.email))
    );
    const existingDnis = new Set(
      (existingDnisRes.data || []).map((profile: any) => normalizeDni(profile.dni))
    );

    const usersToCreate = uniqueUsers.filter((user) => {
      if (existingEmails.has(user.email) || existingDnis.has(user.dni)) {
        results.skipped++;
        return false;
      }

      existingEmails.add(user.email);
      existingDnis.add(user.dni);
      return true;
    });

    let cursor = 0;
    const concurrency = Math.min(4, usersToCreate.length || 1);

    const processUser = async () => {
      while (cursor < usersToCreate.length) {
        const user = usersToCreate[cursor++];
        const nombreCompleto = `${user.apellido} ${user.nombre}`.trim();

        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: user.email,
          password: user.dni,
          email_confirm: true,
          user_metadata: {
            nombre_completo: nombreCompleto,
            dni: user.dni,
            carrera: user.carrera,
          },
        });

        if (createError || !newUser?.user) {
          results.errors.push(`Error creando ${user.email}: ${createError?.message || "No se pudo crear el usuario"}`);
          results.skipped++;
          continue;
        }

        if (user.porcentaje_beca === 50 || user.porcentaje_beca === 100) {
          const { error: becaError } = await adminClient.from("becas").insert({
            user_id: newUser.user.id,
            tipo: user.porcentaje_beca.toString() as any,
            estado: "aprobada" as any,
            fecha_inicio: new Date().toISOString().split("T")[0],
          });

          if (becaError) {
            results.errors.push(`Error asignando beca a ${user.email}: ${becaError.message}`);
          }
        }

        results.created++;
      }
    };

    await Promise.all(Array.from({ length: concurrency }, () => processUser()));

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
