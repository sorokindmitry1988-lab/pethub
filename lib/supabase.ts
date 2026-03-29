import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"): string {
  const raw = process.env[name];
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) {
    throw new Error(
      `[Supabase] Не задана переменная окружения ${name}. Укажите её в .env.local (Project URL и anon public key из панели Supabase).`
    );
  }
  return value;
}

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
