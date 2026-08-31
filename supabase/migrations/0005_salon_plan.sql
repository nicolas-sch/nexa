-- Nexa: paid listing plans. "top" salons get sorted first and show a badge.
-- Plan is admin-controlled (set manually after payment via the dashboard),
-- never owner-editable — locked the same way status/owner_id already are.
-- Apply via `supabase db push` or paste into the Supabase dashboard's SQL editor.

alter table public.salons
  add column plan text not null default 'basic' check (plan in ('basic', 'top'));

create or replace function public.lock_salon_moderation_fields()
returns trigger
language plpgsql
as $$
begin
  new.status := old.status;
  new.owner_id := old.owner_id;
  new.plan := old.plan;
  new.updated_at := now();
  return new;
end;
$$;
