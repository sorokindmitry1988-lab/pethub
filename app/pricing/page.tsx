import Link from "next/link";
import { PricingCheckoutButton } from "@/components/PricingCheckoutButton";

const plans = [
  {
    title: "Бесплатный",
    items: ["2 вопроса ветеринару", "Базовая история вопросов"],
    showCta: false,
  },
  {
    title: "Платный",
    items: [
      "Неограниченные вопросы",
      "Полная история обращений",
      "Будущие премиум-функции",
    ],
    showCta: true,
  },
] as const;

export default function PricingPage() {
  return (
    <div className="min-h-dvh bg-zinc-50 font-sans dark:bg-black">
      <div className="mx-auto w-full max-w-lg px-4 py-8 sm:max-w-2xl sm:px-6 sm:py-10 md:max-w-4xl md:py-12">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-500"
        >
          ← На главную
        </Link>

        <header className="mt-6 space-y-2 sm:mt-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Тарифы
          </h1>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
            Выберите подходящий план для вопросов ветеринару и истории обращений.
          </p>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.title}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 sm:text-xl">
                {plan.title}
              </h2>
              <ul className="mt-4 flex flex-1 flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
                {plan.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {plan.showCta ? <PricingCheckoutButton /> : null}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
