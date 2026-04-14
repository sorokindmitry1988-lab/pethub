import { createBrowserClient } from "@supabase/ssr";

function trimEnv(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function createClient() {
  // Важно: обращаться к NEXT_PUBLIC_* только через литералы в process.env,
  // иначе Next.js не встроит значения в клиентский бандл (динамический ключ даёт пустую строку).
  const supabaseUrl = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseUrl) {
    throw new Error(
      "[Supabase] Не задана переменная окружения NEXT_PUBLIC_SUPABASE_URL. Укажите её в .env.local (Project URL и anon public key из панели Supabase)."
    );
  }
  if (!supabaseAnonKey) {
    throw new Error(
      "[Supabase] Не задана переменная окружения NEXT_PUBLIC_SUPABASE_ANON_KEY. Укажите её в .env.local (Project URL и anon public key из панели Supabase)."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}