import { createBrowserClient } from "@supabase/ssr";

function requireEnv(
  name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
): string {
  const raw = process.env[name];
  const value = typeof raw === "string" ? raw.trim() : "";

  if (!value) {
    throw new Error(
      `[Supabase] Не задана переменная окружения ${name}. Укажите её в .env.local (Project URL и anon public key из панели Supabase).`
    );
  }

  return value;
}

export function createClient() {
  return createBrowserClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}