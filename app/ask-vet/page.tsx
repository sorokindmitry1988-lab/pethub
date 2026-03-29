import AskVetForm from "@/components/AskVetForm";

export default function AskVetPage() {
  return (
    <div className="min-h-dvh bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto w-full max-w-lg px-4 py-8 sm:max-w-xl sm:px-6 sm:py-10 md:max-w-2xl md:py-12">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Задать вопрос ветеринару
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
            Заполните форму — ветеринар сможет оценить ситуацию по вашему
            описанию.
          </p>
        </header>

        <AskVetForm />
      </main>
    </div>
  );
}
