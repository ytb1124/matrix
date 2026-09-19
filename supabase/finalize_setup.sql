-- Run after supabase/schema.sql and after the four users exist in Authentication.
insert into public.admin_users (user_id) values
  ('9c354542-c270-4403-8393-e6f5e963fcde'),
  ('a2c15632-9cfe-40f4-85bd-dd43e80bc3e7'),
  ('92b07a0a-8b2c-4ad6-a1fb-91d229c5037a'),
  ('6af7e2b7-bb29-41dc-aeab-76e8d44793c0')
on conflict (user_id) do nothing;

-- RLS audit: these should all return true.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('venues','rental_rates','venue_staff','audio_systems','venue_equipment','venue_facilities','sources','venue_images','admin_users')
order by tablename;

-- Confirm the image bucket exists and is public for read-only delivery.
select id, name, public from storage.buckets where id = 'venue-images';
