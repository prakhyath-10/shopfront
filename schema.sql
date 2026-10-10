-- ShopFront starter schema
-- Run this once in Supabase: SQL Editor > New query > paste > Run

-- 1. Shops: one row per business
create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  slug text not null unique,
  category text not null default 'other'
    check (category in ('retail', 'bakery', 'salon', 'tutor', 'clinic', 'other')),
  description text,
  created_at timestamptz not null default now()
);

-- 2. Items: products (retail/bakery) or services (salon/tutor/clinic)
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  name text not null,
  description text,
  price_cents integer not null default 0 check (price_cents >= 0),
  image_url text,
  kind text not null default 'product' check (kind in ('product', 'service')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Bookings: customer requests for a service or time slot
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  item_id uuid references public.items (id) on delete set null,
  customer_name text not null,
  customer_contact text not null,
  starts_at timestamptz,
  note text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists items_shop_id_idx on public.items (shop_id);
create index if not exists bookings_shop_id_idx on public.bookings (shop_id);
create index if not exists shops_owner_id_idx on public.shops (owner_id);

-- 4. Turn on Row Level Security (REQUIRED: your anon key is public)
alter table public.shops enable row level security;
alter table public.items enable row level security;
alter table public.bookings enable row level security;

-- Shops: anyone can view; only the owner can create/change/delete
create policy "Shops are viewable by everyone"
  on public.shops for select
  using (true);

create policy "Owners can create their shops"
  on public.shops for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Owners can update their shops"
  on public.shops for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Owners can delete their shops"
  on public.shops for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

-- Items: anyone can view active items; only the shop owner can manage them
create policy "Active items are viewable by everyone"
  on public.items for select
  using (active = true);

create policy "Owners can view all their items"
  on public.items for select
  to authenticated
  using (exists (
    select 1 from public.shops s
    where s.id = items.shop_id and s.owner_id = (select auth.uid())
  ));

create policy "Owners can add items"
  on public.items for insert
  to authenticated
  with check (exists (
    select 1 from public.shops s
    where s.id = items.shop_id and s.owner_id = (select auth.uid())
  ));

create policy "Owners can update items"
  on public.items for update
  to authenticated
  using (exists (
    select 1 from public.shops s
    where s.id = items.shop_id and s.owner_id = (select auth.uid())
  ));

create policy "Owners can delete items"
  on public.items for delete
  to authenticated
  using (exists (
    select 1 from public.shops s
    where s.id = items.shop_id and s.owner_id = (select auth.uid())
  ));

-- Bookings: anyone can submit one; only the shop owner can see or manage them
create policy "Anyone can create a booking"
  on public.bookings for insert
  to anon, authenticated
  with check (status = 'pending');

create policy "Owners can view bookings"
  on public.bookings for select
  to authenticated
  using (exists (
    select 1 from public.shops s
    where s.id = bookings.shop_id and s.owner_id = (select auth.uid())
  ));

create policy "Owners can update bookings"
  on public.bookings for update
  to authenticated
  using (exists (
    select 1 from public.shops s
    where s.id = bookings.shop_id and s.owner_id = (select auth.uid())
  ));
