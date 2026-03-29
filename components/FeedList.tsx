import { PetCard } from "@/components/PetCard";
import type { Pet } from "@/lib/types";

type FeedListProps = {
  pets: Pet[];
};

export function FeedList({ pets }: FeedListProps) {
  return (
    <ul
      className="grid list-none grid-cols-1 gap-4 p-0 sm:gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
      role="list"
    >
      {pets.map((pet) => (
        <li key={pet.id} className="min-w-0">
          <PetCard pet={pet} />
        </li>
      ))}
    </ul>
  );
}
