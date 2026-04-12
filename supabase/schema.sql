create table if not exists usage_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  feature_key text not null,
  free_limit integer not null default 2,
  used_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table usage_limits enable row level security;

drop policy if exists "Users can read own usage limits" on usage_limits;
create policy "Users can read own usage limits"
on usage_limits
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own usage limits" on usage_limits;
create policy "Users can insert own usage limits"
on usage_limits
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own usage limits" on usage_limits;
create policy "Users can update own usage limits"
on usage_limits
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  stripe_session_id text,
  stripe_customer_id text,
  status text not null default 'pending',
  plan_code text not null default 'premium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table subscriptions enable row level security;

drop policy if exists "Users can read own subscriptions" on subscriptions;
create policy "Users can read own subscriptions"
on subscriptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own subscriptions" on subscriptions;
create policy "Users can insert own subscriptions"
on subscriptions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own subscriptions" on subscriptions;
create policy "Users can update own subscriptions"
on subscriptions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);