import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-zinc-50 px-4 py-8 dark:bg-black sm:px-6">
      <main className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Мой аккаунт
        </h1>

        <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Email
          </p>
          <p className="mt-1 break-all text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {user.email ?? "Email недоступен"}
          </p>
        </div>

        <nav className="mt-6 space-y-3" aria-label="Навигация аккаунта">
          <Link
            href="/"
            className="block rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Главная
          </Link>
          <Link
            href="/feed"
            className="block rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Лента
          </Link>
          <Link
            href="/ask-vet"
            className="block rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Мои вопросы
          </Link>
        </nav>

        <Link
          href="/auth/logout"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Выйти
        </Link>
      </main>
    </div>
  );
}
