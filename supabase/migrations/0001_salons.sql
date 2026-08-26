-- Nexa: salons table, moderation status, and row-level security.
-- Apply via `supabase db push` or paste into the Supabase dashboard's SQL editor.

create table public.salons (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references auth.users(id),
  status       text not null default 'pending'
               check (status in ('pending', 'approved', 'rejected')),

  name         text not null,
  cnpj         text not null,
  street       text not null,
  city         text not null,
  state        text not null,
  lat          double precision,
  lng          double precision,

  whatsapp     text not null,
  instagram    text,
  email        text not null,

  services     text[] not null default '{}',
  photos       text[] not null default '{}'
               check (array_length(photos, 1) is null or array_length(photos, 1) <= 4),

  rating       numeric(2,1) not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index salons_status_idx on public.salons(status);
create index salons_owner_id_idx on public.salons(owner_id);
create unique index salons_cnpj_active_idx on public.salons(cnpj) where status <> 'rejected';

alter table public.salons enable row level security;

-- Public can read approved salons only.
create policy "public can read approved salons"
  on public.salons for select
  using (status = 'approved');

-- An owner can read their own row regardless of status (pending/rejected included).
create policy "owner can read own salon"
  on public.salons for select
  using (auth.uid() = owner_id);

-- An owner can insert their own salon, but only ever as pending — cannot self-approve.
create policy "owner can insert own salon as pending"
  on public.salons for insert
  with check (auth.uid() = owner_id and status = 'pending');

-- An owner can update their own row (status/owner_id lockdown is enforced by the trigger below).
create policy "owner can update own salon"
  on public.salons for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Prevent an owner from changing status or owner_id via a normal update
-- (approval must happen with the service_role key, e.g. via the Supabase dashboard).
create or replace function public.lock_salon_moderation_fields()
returns trigger
language plpgsql
as $$
begin
  new.status := old.status;
  new.owner_id := old.owner_id;
  new.updated_at := now();
  return new;
end;
$$;

create trigger salons_lock_moderation_fields
  before update on public.salons
  for each row
  execute function public.lock_salon_moderation_fields();

-- Public storage bucket for salon photos (up to 4 per salon, enforced at the app layer).
insert into storage.buckets (id, name, public)
values ('salon-photos', 'salon-photos', true)
on conflict (id) do nothing;

create policy "anyone can view salon photos"
  on storage.objects for select
  using (bucket_id = 'salon-photos');

create policy "authenticated users can upload salon photos"
  on storage.objects for insert
  with check (bucket_id = 'salon-photos' and auth.role() = 'authenticated');
