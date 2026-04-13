import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(
  name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY"
): string {
  const raw = process.env[name];
  const value = typeof raw === "string" ? raw.trim() : "";

  if (!value) {
    throw new Error(
      `[Supabase] Не задана переменная окружения ${name}. Укажите её в .env.local или в Vercel Environment Variables.`
    );
  }

  return value;
}

export function createAdminClient(): SupabaseClient {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}