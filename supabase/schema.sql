create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  service text not null check (service in ('basic', 'standard', 'deep')),
  address text not null,
  date date not null,
  time text not null check (time in ('10:00', '12:00', '14:00', '16:00', '18:00')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'done')),
  created_at timestamptz not null default now(),
  unique (date, time)
);

alter table public.bookings enable row level security;

-- Public users can create bookings and read bookings.
-- For a production system, you may want to replace public select with a limited view/RPC.
create policy "public_insert_booking"
  on public.bookings
  for insert
  to anon, authenticated
  with check (true);

create policy "public_read_bookings"
  on public.bookings
  for select
  to anon, authenticated
  using (true);

create policy "authenticated_update_bookings"
  on public.bookings
  for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_delete_bookings"
  on public.bookings
  for delete
  to authenticated
  using (true);
