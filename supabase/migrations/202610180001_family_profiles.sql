-- Parent-managed family profiles and one-time test entitlements.
-- Apply this migration in the Supabase SQL editor or with the Supabase CLI.

create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 32),
  grade smallint not null check (grade in (6, 7, 8)),
  created_at timestamptz not null default now()
);

create index if not exists child_profiles_parent_created_idx
  on public.child_profiles (parent_id, created_at);

alter table public.child_profiles enable row level security;

create policy "Parents can view their own child profiles"
  on public.child_profiles for select
  to authenticated
  using (parent_id = (select auth.uid()));

create policy "Parents can add child profiles to their own account"
  on public.child_profiles for insert
  to authenticated
  with check (parent_id = (select auth.uid()));

create policy "Parents can update their own child profiles"
  on public.child_profiles for update
  to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()));

create policy "Parents can remove their own child profiles"
  on public.child_profiles for delete
  to authenticated
  using (parent_id = (select auth.uid()));

create table if not exists public.test_entitlements (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users (id) on delete cascade,
  child_profile_id uuid not null references public.child_profiles (id) on delete cascade,
  grade smallint not null check (grade in (6, 7)),
  amount_cents integer not null default 499 check (amount_cents = 499),
  currency text not null default 'USD' check (currency = 'USD'),
  paypal_order_id text not null unique,
  paypal_capture_id text not null unique,
  created_at timestamptz not null default now(),
  constraint one_purchase_per_child_grade unique (child_profile_id, grade)
);

create index if not exists test_entitlements_parent_idx
  on public.test_entitlements (parent_id, child_profile_id, grade);

alter table public.test_entitlements enable row level security;

create policy "Parents can view their own test entitlements"
  on public.test_entitlements for select
  to authenticated
  using (parent_id = (select auth.uid()));

create table if not exists public.test_checkout_attempts (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users (id) on delete cascade,
  child_profile_id uuid not null references public.child_profiles (id) on delete cascade,
  grade smallint not null check (grade in (6, 7)),
  paypal_order_id text unique,
  state text not null default 'pending' check (state in ('pending', 'captured', 'cancelled', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists one_pending_checkout_per_child_grade
  on public.test_checkout_attempts (child_profile_id, grade)
  where state = 'pending';

alter table public.test_checkout_attempts enable row level security;

-- Checkout attempts are internal payment records: no browser-side policies.
-- The Edge Function uses the service-role key only after verifying the parent JWT.

-- No client insert/update/delete policies are intentionally provided.
-- A trusted server-side PayPal capture handler must verify the capture amount,
-- currency, PayPal order status and profile ownership before writing entitlements.
