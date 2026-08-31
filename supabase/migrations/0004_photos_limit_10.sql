-- Nexa: raise salon photos limit from 4 to 10.
-- Apply via `supabase db push` or paste into the Supabase dashboard's SQL editor.

alter table public.salons drop constraint if exists salons_photos_check;

alter table public.salons add constraint salons_photos_check
  check (array_length(photos, 1) is null or array_length(photos, 1) <= 10);
