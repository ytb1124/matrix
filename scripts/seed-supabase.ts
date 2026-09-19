/** Seed the reviewed MATRIX research data into Supabase without overwriting
 * records that already exist. Run with:
 * node --env-file=.env.local --experimental-strip-types scripts/seed-supabase.ts
 */
import { createClient } from "@supabase/supabase-js";
// @ts-expect-error Node's type-stripping loader requires the explicit .ts extension.
import { venues } from "../lib/venues.ts";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required");
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function assertNoError(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

let createdVenues = 0;
let existingVenues = 0;

for (const venue of venues) {
  const { data: existing, error: lookupError } = await supabase
    .from("venues")
    .select("id")
    .eq("slug", venue.slug)
    .maybeSingle();
  assertNoError(lookupError, `${venue.slug} lookup`);

  let venueId = existing?.id as string | undefined;
  if (!venueId) {
    const { data: inserted, error: insertError } = await supabase
      .from("venues")
      .insert({
        slug: venue.slug,
        name: venue.name,
        venue_type: venue.type,
        district: venue.district,
        neighborhood: venue.neighborhood ?? null,
        area_label: venue.area,
        address_display: venue.address,
        nearest_station: venue.nearestStation,
        phone: venue.contact,
        official_url: venue.officialUrl,
        active_status: venue.status,
        capacity_people: venue.capacity,
        stage_size: venue.stageSize ?? null,
        rental_hours: venue.prices.rentalHours,
        tax_included: venue.prices.taxIncluded,
        price_notes: venue.prices.notes,
        latitude: venue.latitude,
        longitude: venue.longitude,
        location_verified: venue.locationVerified ?? false,
        last_checked_at: venue.lastCheckedAt,
        verification_status: venue.verificationStatus,
      })
      .select("id")
      .single();
    assertNoError(insertError, `${venue.slug} insert`);
    venueId = inserted!.id as string;
    createdVenues += 1;
  } else {
    existingVenues += 1;
  }

  const relatedRows = [
    supabase.from("venue_staff").upsert({
      venue_id: venueId,
      sound_engineer_included: venue.staff.soundEngineer,
      monitor_engineer_included: venue.staff.monitorEngineer ?? null,
      lighting_operator_included: venue.staff.lightingOperator,
      stage_staff_included: venue.staff.stageStaff,
      included_notes: venue.staff.includedNotes,
      raw_extra_fee: venue.staff.extraFee,
      notes: venue.staff.notes,
    }, { onConflict: "venue_id", ignoreDuplicates: true }),
    supabase.from("audio_systems").upsert({
      venue_id: venueId,
      foh_console: venue.audio.console,
      main_pa: venue.audio.mainPa,
      monitor_system: venue.audio.monitor,
      wired_mics: venue.audio.wiredMic,
      wireless_mics: venue.audio.wirelessMic,
      di_boxes: venue.audio.diBox,
    }, { onConflict: "venue_id", ignoreDuplicates: true }),
    supabase.from("venue_facilities").upsert({
      venue_id: venueId,
      parking: venue.facilities.parking,
      waiting_room: venue.facilities.waitingRoom,
      accessible: venue.facilities.accessibility,
      elevator: venue.facilities.elevator ?? null,
      easy_load_in: venue.facilities.easyLoadIn ?? null,
    }, { onConflict: "venue_id", ignoreDuplicates: true }),
  ];
  const relatedResults = await Promise.all(relatedRows);
  relatedResults.forEach((result, index) => assertNoError(result.error, `${venue.slug} related row ${index + 1}`));

  const rates = [
    venue.prices.weekday && { day_type: "weekday", raw_text: venue.prices.weekday, price_krw: venue.prices.weekdayMin },
    venue.prices.fridayMin != null && venue.prices.weekday && { day_type: "friday", raw_text: venue.prices.weekday, price_krw: venue.prices.fridayMin },
    venue.prices.saturdayMin != null && venue.prices.weekend && { day_type: "saturday", raw_text: venue.prices.weekend, price_krw: venue.prices.saturdayMin },
    venue.prices.sundayMin != null && venue.prices.weekend && { day_type: "sunday", raw_text: venue.prices.weekend, price_krw: venue.prices.sundayMin },
    venue.prices.weekend && venue.prices.saturdayMin == null && venue.prices.sundayMin == null && { day_type: "saturday", raw_text: venue.prices.weekend, price_krw: venue.prices.weekendMin },
  ].filter(Boolean) as Array<{ day_type: string; raw_text: string; price_krw: number | null }>;

  const { data: existingRates, error: rateLookupError } = await supabase
    .from("rental_rates")
    .select("day_type,raw_text")
    .eq("venue_id", venueId);
  assertNoError(rateLookupError, `${venue.slug} rate lookup`);
  const missingRates = rates.filter((rate) => !(existingRates ?? []).some((existingRate) => existingRate.day_type === rate.day_type && existingRate.raw_text === rate.raw_text));
  if (missingRates.length) {
    const { error } = await supabase.from("rental_rates").insert(missingRates.map((rate) => ({ ...rate, venue_id: venueId })));
    assertNoError(error, `${venue.slug} rates`);
  }

  const sourceRows = [
    venue.officialUrl && { kind: "official", url: venue.officialUrl },
    venue.sourceUrl && { kind: "mule", url: venue.sourceUrl },
  ].filter(Boolean) as Array<{ kind: string; url: string }>;
  const { data: existingSources, error: sourceLookupError } = await supabase
    .from("sources")
    .select("kind,url")
    .eq("venue_id", venueId);
  assertNoError(sourceLookupError, `${venue.slug} source lookup`);
  const missingSources = sourceRows.filter((source) => !(existingSources ?? []).some((existingSource) => existingSource.kind === source.kind && existingSource.url === source.url));
  if (missingSources.length) {
    const { error } = await supabase.from("sources").insert(missingSources.map((source) => ({ ...source, venue_id: venueId })));
    assertNoError(error, `${venue.slug} sources`);
  }

  const equipment = [
    ["drums", venue.backline.drums],
    ["guitar_amp", venue.backline.guitarAmp],
    ["bass_amp", venue.backline.bassAmp],
    ["keyboard", venue.backline.keyboard],
    ["backline_notes", venue.backline.notes],
    ["lighting_fixture", venue.lighting?.fixtures],
    ["moving_light", venue.lighting?.movingLights],
    ["follow_spot", venue.lighting?.followSpot],
    ["lighting_console", venue.lighting?.console],
    ["lighting_notes", venue.lighting?.notes],
  ].filter((item): item is [string, string] => Boolean(item[1]));
  if (equipment.length) {
    const { error } = await supabase.from("venue_equipment").upsert(
      equipment.map(([category, raw_description]) => ({ venue_id: venueId, category, raw_description })),
      { onConflict: "venue_id,category,raw_description", ignoreDuplicates: true },
    );
    assertNoError(error, `${venue.slug} equipment`);
  }
}

const tables = ["venues", "rental_rates", "venue_staff", "audio_systems", "venue_equipment", "venue_facilities", "sources"];
const counts: Record<string, number> = {};
for (const table of tables) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  assertNoError(error, `${table} count`);
  counts[table] = count ?? 0;
}

console.log(JSON.stringify({ createdVenues, existingVenues, counts }, null, 2));
