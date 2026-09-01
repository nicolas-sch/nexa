-- Nexa: during the free-launch period (no payment integration yet), owners
-- pick their own plan (basic/top) at signup and can change it by re-editing
-- their listing — there's nothing to defraud since it's free either way.
-- Unlock `plan` from the moderation-fields trigger for that reason.
--
-- IMPORTANT: once real payment integration ships, re-lock `plan` here
-- (add back `new.plan := old.plan;` inside the `if auth.role() = 'authenticated'`
-- branch) so only a paid webhook/admin action can set plan = 'top'.
-- Apply via `supabase db push` or paste into the Supabase dashboard's SQL editor.

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
