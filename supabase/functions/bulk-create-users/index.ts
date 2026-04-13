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

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("No authorization");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const callerClient = createClient(
    supabaseUrl,
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || serviceRoleKey,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user: caller } } = await callerClient.auth.getUser();
  if (!caller) throw new Error("Unauthorized");

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: isAdmin } = await adminClient.rpc("has_role", {
    _user_id: caller.id,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Not admin");

  return adminClient;
}

async function handleDeleteAll(adminClient: ReturnType<typeof createClient>) {
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
    const tables = ["ordenes", "becas", "beca_uso_mensual", "turnos", "pagos", "profiles", "user_roles"];
    for (const table of tables) {
      await adminClient.from(table).delete().eq("user_id", p.user_id);
    }
    await adminClient.auth.admin.deleteUser(p.user_id);
    deleted++;
  }
  return { success: true, deleted };
}

async function upsertBeca(
  adminClient: ReturnType<typeof createClient>,
  userId: string,
  porcentajeBeca: number,
  email: string,
  results: { updated: number; errors: string[] }
) {
  if (porcentajeBeca !== 50 && porcentajeBeca !== 100) return;

  const tipo = porcentajeBeca.toString() as any;

  // Check if user already has an active beca
  const { data: existingBecas } = await adminClient
    .from("becas")
    .select("id, tipo, estado")
    .eq("user_id", userId)
    .eq("estado", "aprobada");

  const activeBeca = (existingBecas || [])[0];

  if (activeBeca && activeBeca.tipo === tipo) {
    // Same beca already exists, skip
    return;
  }

  if (activeBeca && activeBeca.tipo !== tipo) {
    // Different beca, update it
    const { error } = await adminClient
      .from("becas")
      .update({ tipo, fecha_inicio: new Date().toISOString().split("T")[0] })
      .eq("id", activeBeca.id);
    if (error) {
      results.errors.push(`Error actualizando beca de ${email}: ${error.message}`);
    } else {
      results.updated++;
    }
    return;
  }

  // No active beca, create one
  const { error } = await adminClient.from("becas").insert({
    user_id: userId,
    tipo,
    estado: "aprobada" as any,
    fecha_inicio: new Date().toISOString().split("T")[0],
  });
  if (error) {
    results.errors.push(`Error asignando beca a ${email}: ${error.message}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminClient = await verifyAdmin(req);
    const { users, action } = await req.json();

    if (action === "delete_all") {
      const result = await handleDeleteAll(adminClient);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(users) || users.length === 0) {
      return new Response(JSON.stringify({ error: "No users provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = { created: 0, skipped: 0, updated: 0, errors: [] as string[] };

    // Deduplicate within the batch
    const uniqueUsers: typeof users = [];
    const seenDnis = new Set<string>();
    const seenEmails = new Set<string>();

    for (const rawUser of users) {
      const email = normalizeEmail(rawUser.email);
      const dni = normalizeDni(rawUser.dni);
      if (!dni || !email) { results.skipped++; continue; }
      if (seenDnis.has(dni) || seenEmails.has(email)) { results.skipped++; continue; }
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

    // Process users sequentially to avoid race conditions
    for (const user of uniqueUsers) {
      const nombreCompleto = `${user.apellido} ${user.nombre}`.trim();

      // Check if user already exists by DNI or email
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("user_id")
        .or(`dni.eq.${user.dni},email.eq.${user.email}`)
        .limit(1)
        .maybeSingle();

      if (existingProfile) {
        // User exists — just update beca if needed
        await upsertBeca(adminClient, existingProfile.user_id, user.porcentaje_beca, user.email, results);
        results.skipped++;
        continue;
      }

      // Create new user
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
        results.errors.push(`Error creando ${user.email}: ${createError?.message || "No se pudo crear"}`);
        results.skipped++;
        continue;
      }

      // Assign beca if applicable
      await upsertBeca(adminClient, newUser.user.id, user.porcentaje_beca, user.email, results);
      results.created++;
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const status = (err as Error).message === "Not admin" ? 403 : 
                   (err as Error).message === "Unauthorized" ? 401 : 500;
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
