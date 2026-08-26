-- Fix: the moderation lockdown trigger from 0001 was blocking ALL updates,
-- including manual approvals done in the Supabase dashboard's Table Editor
-- (which don't go through PostgREST's auth context). Only lock status/owner_id
-- when the update comes from an authenticated end user via the app (anon key +
-- JWT) — dashboard/SQL-editor edits and service_role calls are unaffected.

create or replace function public.lock_salon_moderation_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'authenticated' then
    new.status := old.status;
    new.owner_id := old.owner_id;
  end if;

  new.updated_at := now();
  return new;
end;
$$;
