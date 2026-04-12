import { SubscribeButton } from "@/components/SubscribeButton";
import type { Pet } from "@/lib/types";
import Image from "next/image";

type PetCardProps = {
  pet: Pet;
};

export function PetCard({ pet }: PetCardProps) {
  const speciesBreed = [pet.species, pet.breed].filter(Boolean).join(" · ");
  const bioOrNotes = pet.notes?.trim() ?? "Описание пока не добавлено.";

  return (
    <article className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:max-w-none">
      <div className="relative aspect-[4/3] w-full shrink-0 bg-zinc-100 dark:bg-zinc-900">
        {pet.photo_url ? (
          <Image
            src={pet.photo_url}
            alt={`Фото питомца ${pet.name}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-4xl font-semibold text-zinc-400 dark:text-zinc-600"
            aria-hidden
          >
            {pet.name.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold leading-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">
            {pet.name}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {speciesBreed}
          </p>
        </header>

        <p className="line-clamp-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {bioOrNotes}
        </p>

        <div className="mt-auto pt-1">
          <SubscribeButton />
        </div>
      </div>
    </article>
  );
}
