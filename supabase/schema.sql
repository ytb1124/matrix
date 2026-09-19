create extension if not exists pgcrypto;

create type public.venue_verification_status as enum ('unverified', 'needs_review', 'verified');
create type public.source_kind as enum ('official', 'mule', 'phone', 'social', 'other');
create type public.rate_day_type as enum ('weekday', 'friday', 'saturday', 'sunday', 'holiday', 'hourly', 'other');

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  venue_type text,
  district text,
  neighborhood text,
  area_label text,
  address_display text not null,
  address_normalized text,
  nearest_station text,
  phone text,
  email text,
  official_url text,
  active_status text,
  capacity_people integer check (capacity_people is null or capacity_people > 0),
  stage_width_m numeric(6,2),
  stage_depth_m numeric(6,2),
  stage_size text,
  rental_hours text,
  tax_included boolean,
  price_notes text,
  latitude numeric(10,7) check (latitude is null or latitude between -90 and 90),
  longitude numeric(10,7) check (longitude is null or longitude between -180 and 180),
  location_verified boolean not null default false,
  geocoded_at timestamptz,
  geocoded_address text,
  address_hash text,
  verification_status public.venue_verification_status not null default 'unverified',
  last_checked_at date,
  general_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rental_rates (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  day_type public.rate_day_type not null,
  price_krw integer check (price_krw is null or price_krw >= 0),
  audience_type text,
  valid_months smallint[],
  included_hours numeric(5,2),
  tax_included boolean,
  raw_text text not null,
  notes text,
  unique (venue_id, day_type, audience_type, valid_months, price_krw)
);

create table public.venue_staff (
  venue_id uuid primary key references public.venues(id) on delete cascade,
  sound_engineer_included boolean,
  monitor_engineer_included boolean,
  lighting_operator_included boolean,
  stage_staff_included boolean,
  included_notes text,
  extra_fee_krw integer check (extra_fee_krw is null or extra_fee_krw >= 0),
  raw_extra_fee text,
  notes text
);

create table public.audio_systems (
  venue_id uuid primary key references public.venues(id) on delete cascade,
  foh_console text,
  main_pa text,
  monitor_system text,
  stagebox text,
  channel_spec text,
  wired_mics text,
  wireless_mics text,
  di_boxes text,
  audio_notes text
);

create table public.equipment_catalog (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  manufacturer text,
  model text,
  normalized_name text not null,
  unique(category, normalized_name)
);

create table public.venue_equipment (
  venue_id uuid not null references public.venues(id) on delete cascade,
  equipment_id uuid references public.equipment_catalog(id) on delete set null,
  category text not null,
  raw_description text not null,
  quantity integer check (quantity is null or quantity >= 0),
  included boolean,
  notes text,
  primary key (venue_id, category, raw_description)
);

create table public.venue_facilities (
  venue_id uuid primary key references public.venues(id) on delete cascade,
  waiting_room boolean,
  parking boolean,
  elevator boolean,
  easy_load_in boolean,
  restroom boolean,
  hvac boolean,
  accessible boolean,
  wifi boolean,
  notes text
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  kind public.source_kind not null,
  url text,
  posted_at date,
  raw_copy text,
  reliability text,
  notes text
);

create table public.verification_records (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  checked_at date not null,
  checked_by text,
  status public.venue_verification_status not null,
  follow_up_needed boolean,
  notes text
);

create table public.venue_images (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  storage_path text not null unique,
  public_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()) $$;

alter table public.venues enable row level security;
alter table public.rental_rates enable row level security;
alter table public.venue_staff enable row level security;
alter table public.audio_systems enable row level security;
alter table public.equipment_catalog enable row level security;
alter table public.venue_equipment enable row level security;
alter table public.venue_facilities enable row level security;
alter table public.sources enable row level security;
alter table public.verification_records enable row level security;
alter table public.venue_images enable row level security;
alter table public.admin_users enable row level security;

create policy "Public read venues" on public.venues for select using (true);
create policy "Public read rental rates" on public.rental_rates for select using (true);
create policy "Public read venue staff" on public.venue_staff for select using (true);
create policy "Public read audio systems" on public.audio_systems for select using (true);
create policy "Public read equipment catalog" on public.equipment_catalog for select using (true);
create policy "Public read venue equipment" on public.venue_equipment for select using (true);
create policy "Public read venue facilities" on public.venue_facilities for select using (true);
create policy "Public read sources" on public.sources for select using (true);
create policy "Public read verification records" on public.verification_records for select using (true);
create policy "Public read venue images" on public.venue_images for select using (true);
create policy "Admin reads own role" on public.admin_users for select using (user_id = auth.uid());

create policy "Admins manage venues" on public.venues for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage rental rates" on public.rental_rates for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage venue staff" on public.venue_staff for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage audio systems" on public.audio_systems for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage equipment catalog" on public.equipment_catalog for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage venue equipment" on public.venue_equipment for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage venue facilities" on public.venue_facilities for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage sources" on public.sources for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage verification records" on public.verification_records for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage venue images" on public.venue_images for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public) values ('venue-images', 'venue-images', true)
on conflict (id) do update set public = excluded.public;
create policy "Public read venue image objects" on storage.objects for select using (bucket_id = 'venue-images');
create policy "Admins upload venue image objects" on storage.objects for insert with check (bucket_id = 'venue-images' and public.is_admin());
create policy "Admins update venue image objects" on storage.objects for update using (bucket_id = 'venue-images' and public.is_admin()) with check (bucket_id = 'venue-images' and public.is_admin());
create policy "Admins delete venue image objects" on storage.objects for delete using (bucket_id = 'venue-images' and public.is_admin());

create index venues_search_idx on public.venues using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(area_label,'') || ' ' || coalesce(address_display,'') || ' ' || coalesce(nearest_station,'')));
create index venues_geo_idx on public.venues (latitude, longitude) where latitude is not null and longitude is not null;
create index rental_rates_filter_idx on public.rental_rates (day_type, price_krw);
create index venue_equipment_filter_idx on public.venue_equipment (category, venue_id);
create index verification_latest_idx on public.verification_records (venue_id, checked_at desc);
create index venue_images_order_idx on public.venue_images (venue_id, sort_order);
