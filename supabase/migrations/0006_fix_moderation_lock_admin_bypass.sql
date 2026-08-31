-- Nexa: the moderation-fields lock (status/owner_id/plan) was blocking every
-- update unconditionally, including manual admin edits run directly in the
-- SQL Editor — Postgres does not exempt superusers from row triggers.
-- Only lock these fields when the update comes from the app as an
-- authenticated owner (auth.role() = 'authenticated'); direct SQL as
-- postgres/service_role has no JWT context, so auth.role() is null there
-- and the lock is skipped, letting admin edits through.
-- Apply via `supabase db push` or paste into the Supabase dashboard's SQL editor.

create or replace function public.lock_salon_moderation_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'authenticated' then
    new.status := old.status;
    new.owner_id := old.owner_id;
    new.plan := old.plan;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
