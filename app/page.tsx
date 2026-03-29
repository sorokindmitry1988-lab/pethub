import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-dvh bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-10 sm:max-w-xl sm:px-6 sm:py-12 md:max-w-2xl md:py-16">
        <header className="space-y-3 text-center sm:space-y-4 sm:text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl md:text-5xl">
            PetHub
          </h1>
          <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Платформа для владельцев питомцев: смотрите ленту чужих любимцев,
            делитесь своими и при необходимости задайте вопрос ветеринару онлайн.
          </p>
        </header>
        <nav
          className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4"
          aria-label="Основные разделы"
        >
          <Link
            href="/feed"
            className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3.5 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-100 sm:w-auto sm:min-w-[200px] sm:px-8"
          >
            Открыть ленту питомцев
          </Link>
          <Link
            href="/ask-vet"
            className="inline-flex w-full items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3.5 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-500 sm:w-auto sm:min-w-[200px] sm:px-8"
          >
            Задать вопрос ветеринару
          </Link>
        </nav>
      </main>
    </div>
  );
}
