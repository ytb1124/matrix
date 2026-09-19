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
  latitude numeric(10,7) check (latitude is null or latitude between -90 and 90),
  longitude numeric(10,7) check (longitude is null or longitude between -180 and 180),
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

create index venues_search_idx on public.venues using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(area_label,'') || ' ' || coalesce(address_display,'') || ' ' || coalesce(nearest_station,'')));
create index venues_geo_idx on public.venues (latitude, longitude) where latitude is not null and longitude is not null;
create index rental_rates_filter_idx on public.rental_rates (day_type, price_krw);
create index venue_equipment_filter_idx on public.venue_equipment (category, venue_id);
create index verification_latest_idx on public.verification_records (venue_id, checked_at desc);

