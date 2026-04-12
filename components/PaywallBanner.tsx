import Link from "next/link";

export default function PaywallBanner() {
  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Бесплатный лимит исчерпан
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Вы использовали все бесплатные вопросы. Чтобы продолжить, подключите
        платный доступ.
      </p>

      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
        <li>Больше вопросов ветеринару</li>
        <li>Персональная история обращений</li>
        <li>Будущие премиум-возможности</li>
      </ul>

      <div className="mt-5">
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Посмотреть тарифы
        </Link>
      </div>
    </div>
  );
}