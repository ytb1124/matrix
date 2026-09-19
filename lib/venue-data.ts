import { createClient } from "@supabase/supabase-js";
import { venues as fallbackVenues, type Venue } from "@/lib/venues";

type Row = Record<string, unknown>;

function bool(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function first<T>(value: T[] | T | null | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function mapRow(row: Row): Venue {
  const staff = (first(row.venue_staff as Row[] | Row) ?? {}) as Row;
  const audio = (first(row.audio_systems as Row[] | Row) ?? {}) as Row;
  const facilities = (first(row.venue_facilities as Row[] | Row) ?? {}) as Row;
  const images = Array.isArray(row.venue_images) ? (row.venue_images as Row[]).sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)) : [];
  const rates = Array.isArray(row.rental_rates) ? row.rental_rates as Row[] : [];
  const equipment = Array.isArray(row.venue_equipment) ? row.venue_equipment as Row[] : [];
  const weekdayRates = rates.filter((rate) => ["weekday", "friday", "hourly"].includes(String(rate.day_type)));
  const weekendRates = rates.filter((rate) => ["saturday", "sunday", "holiday"].includes(String(rate.day_type)));
  const rateText = (items: Row[]) => items.map((item) => item.raw_text).filter(Boolean).join(" · ") || null;
  const minRate = (items: Row[]) => {
    const numbers = items.map((item) => numberOrNull(item.price_krw)).filter((value): value is number => value !== null);
    return numbers.length ? Math.min(...numbers) : null;
  };
  const byCategory = (category: string) => equipment.filter((item) => item.category === category).map((item) => item.raw_description).filter(Boolean).join("\n") || null;
  return {
    slug: String(row.slug),
    name: String(row.name),
    type: String(row.venue_type ?? "공연장"),
    district: String(row.district ?? ""),
    neighborhood: row.neighborhood ? String(row.neighborhood) : null,
    area: String(row.area_label ?? "기타"),
    address: String(row.address_display ?? ""),
    nearestStation: String(row.nearest_station ?? ""),
    contact: String(row.phone ?? row.contact ?? ""),
    officialUrl: String(row.official_url ?? ""),
    sourceUrl: String((Array.isArray(row.sources) ? (row.sources as Row[]).find((source) => source.kind === "mule")?.url : "") ?? ""),
    status: String(row.active_status ?? "운영 상태 확인 필요"),
    capacity: numberOrNull(row.capacity_people),
    images: images.map((image) => String(image.public_url)).filter(Boolean),
    stageSize: row.stage_size ? String(row.stage_size) : null,
    prices: {
      weekday: rateText(weekdayRates), weekend: rateText(weekendRates),
      weekdayMin: minRate(weekdayRates), weekendMin: minRate(weekendRates),
      fridayMin: minRate(rates.filter((rate) => rate.day_type === "friday")),
      saturdayMin: minRate(rates.filter((rate) => rate.day_type === "saturday")),
      sundayMin: minRate(rates.filter((rate) => rate.day_type === "sunday")),
      rentalHours: row.rental_hours ? String(row.rental_hours) : null,
      taxIncluded: bool(row.tax_included), notes: row.price_notes ? String(row.price_notes) : null,
    },
    staff: {
      soundEngineer: bool(staff.sound_engineer_included), monitorEngineer: bool(staff.monitor_engineer_included),
      lightingOperator: bool(staff.lighting_operator_included), stageStaff: bool(staff.stage_staff_included),
      includedNotes: staff.included_notes ? String(staff.included_notes) : null,
      extraFee: staff.raw_extra_fee ? String(staff.raw_extra_fee) : null,
      notes: staff.notes ? String(staff.notes) : null,
    },
    audio: {
      console: audio.foh_console ? String(audio.foh_console) : null,
      mainPa: audio.main_pa ? String(audio.main_pa) : null,
      monitor: audio.monitor_system ? String(audio.monitor_system) : null,
      wiredMic: audio.wired_mics ? String(audio.wired_mics) : null,
      wirelessMic: audio.wireless_mics ? String(audio.wireless_mics) : null,
      diBox: audio.di_boxes ? String(audio.di_boxes) : null,
    },
    backline: {
      drums: byCategory("drums"), guitarAmp: byCategory("guitar_amp"), bassAmp: byCategory("bass_amp"),
      keyboard: byCategory("keyboard"), notes: byCategory("backline_notes"),
    },
    facilities: {
      parking: bool(facilities.parking), waitingRoom: bool(facilities.waiting_room), accessibility: bool(facilities.accessible),
      elevator: bool(facilities.elevator), easyLoadIn: bool(facilities.easy_load_in),
    },
    lighting: {
      fixtures: byCategory("lighting_fixture"), movingLights: byCategory("moving_light"),
      followSpot: byCategory("follow_spot"), console: byCategory("lighting_console"), notes: byCategory("lighting_notes"),
    },
    latitude: numberOrNull(row.latitude), longitude: numberOrNull(row.longitude),
    locationVerified: row.location_verified === true,
    geocodedAt: row.geocoded_at ? String(row.geocoded_at) : null,
    lastCheckedAt: row.last_checked_at ? String(row.last_checked_at) : null,
    verificationStatus: ["verified", "needs_review"].includes(String(row.verification_status)) ? String(row.verification_status) as "verified" | "needs_review" : "unverified",
    accent: "charcoal",
  } as Venue;
}

export async function getVenues(): Promise<Venue[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    if (process.env.NODE_ENV !== "production") console.warn("MATRIX: NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY가 없어 로컬 조사 데이터로 표시합니다.");
    return fallbackVenues;
  }
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase.from("venues").select("*, venue_staff(*), audio_systems(*), venue_facilities(*), rental_rates(*), venue_equipment(*), venue_images(*), sources(*)").order("name");
    if (error || !data?.length) {
      if (process.env.NODE_ENV !== "production") console.error("MATRIX: Supabase 공연장 조회 실패", error?.message ?? "데이터 없음");
      return fallbackVenues;
    }
    return data.map((row) => mapRow(row as Row));
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("MATRIX: Supabase 연결 실패", error);
    return fallbackVenues;
  }
}

export async function getVenueBySlug(slug: string): Promise<Venue | undefined> {
  return (await getVenues()).find((venue) => venue.slug === slug);
}

export function getPublicSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  };
}
