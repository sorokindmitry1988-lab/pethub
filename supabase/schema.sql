create table if not exists vet_questions (
  id uuid primary key default gen_random_uuid(),
  pet_type text not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);