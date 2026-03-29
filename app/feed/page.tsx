import { FeedList } from "@/components/FeedList";
import { mockPets } from "@/lib/mock-data";

export default function FeedPage() {
  return (
    <div className="min-h-dvh bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12">
        <header className="mb-6 max-w-2xl sm:mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Лента питомцев
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
            Знакомьтесь с питомцами сообщества — карточки, фото и краткие
            описания в одном месте.
          </p>
        </header>
        <FeedList pets={mockPets} />
      </main>
    </div>
  );
}
