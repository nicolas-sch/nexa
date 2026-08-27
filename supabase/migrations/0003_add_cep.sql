-- Nexa: add cep column to salons.
-- Apply via `supabase db push` or paste into the Supabase dashboard's SQL editor.

alter table public.salons add column cep text;
