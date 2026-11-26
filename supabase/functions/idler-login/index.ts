// Edge Function "idler-login": logowanie nickiem lub e-mailem BEZ ujawniania adresów e-mail.
// Przeglądarka wysyła { identifier, password }. Jeśli identifier nie zawiera "@", funkcja po stronie
// serwera zamienia nick na e-mail (kluczem service_role, którego nie widać w grze), loguje użytkownika
// i zwraca tylko sesję. E-mail nigdy nie trafia do przeglądarki osoby, która się loguje cudzym nickiem.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return reply(405, { error: "method" });
  }

  let identifier = "";
  let password = "";

  try {
    const body = await request.json();
    identifier = String(body?.identifier ?? "").trim();
    password = String(body?.password ?? "");
  } catch (_error) {
    return reply(400, { error: "bad_request" });
  }

  if (!identifier || !password || identifier.length > 254 || password.length > 200) {
    return reply(400, { error: "bad_request" });
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  let email = identifier;

  if (!identifier.includes("@")) {
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const { data: profile } = await admin
      .from("player_profiles")
      .select("id")
      .ilike("username", identifier.replace(/[\\%_]/g, "\\$&"))
      .maybeSingle();

    let found = "";

    if (profile?.id) {
      const { data: user } = await admin.auth.admin.getUserById(profile.id);
      found = user?.user?.email ?? "";
    }

    // Nieznany nick wygląda tak samo jak złe hasło.
    if (!found) {
      return reply(401, { error: "invalid" });
    }

    email = found;
  }

  const publicClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await publicClient.auth.signInWithPassword({ email, password });

  if (error || !data?.session) {
    const message = String(error?.message ?? "").toLowerCase();
    return reply(401, {
      error: message.includes("email not confirmed") ? "not_confirmed" : "invalid",
    });
  }

  return reply(200, {
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  });
});
