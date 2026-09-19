/** Geocode changed Supabase venue addresses with Naver Maps.
 * Coordinates remain unverified until an administrator reviews the match.
 */
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const naverId = process.env.NAVER_MAPS_GEOCODING_CLIENT_ID;
const naverSecret = process.env.NAVER_MAPS_GEOCODING_CLIENT_SECRET;
if (!supabaseUrl || !secretKey || !naverId || !naverSecret) throw new Error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, NAVER_MAPS_GEOCODING_CLIENT_ID, NAVER_MAPS_GEOCODING_CLIENT_SECRET are required");

const supabase = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } });
const { data: venues, error } = await supabase.from("venues").select("id,slug,address_display,address_normalized,address_hash,latitude,longitude");
if (error) throw error;

for (const venue of venues ?? []) {
  const address = (venue.address_normalized || venue.address_display || "").trim();
  if (!address) { console.warn(`${venue.slug}: address missing`); continue; }
  const addressHash = createHash("sha256").update(address).digest("hex");
  if (venue.address_hash === addressHash && venue.latitude != null && venue.longitude != null) { console.log(`${venue.slug}: unchanged`); continue; }
  const response = await fetch(`https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`, { headers: { "x-ncp-apigw-api-key-id": naverId, "x-ncp-apigw-api-key": naverSecret } });
  if (!response.ok) { console.error(`${venue.slug}: Naver ${response.status}`); continue; }
  const json = await response.json() as { addresses?: Array<{ x: string; y: string; roadAddress: string; jibunAddress: string }> };
  const match = json.addresses?.[0];
  const update = match ? { address_hash: addressHash, latitude: Number(match.y), longitude: Number(match.x), geocoded_at: new Date().toISOString(), geocoded_address: match.roadAddress || match.jibunAddress || null, location_verified: false, verification_status: "needs_review" } : { address_hash: addressHash, latitude: null, longitude: null, geocoded_at: null, geocoded_address: null, location_verified: false, verification_status: "needs_review" };
  const { error: updateError } = await supabase.from("venues").update(update).eq("id", venue.id);
  if (updateError) console.error(`${venue.slug}: ${updateError.message}`); else console.log(`${venue.slug}: ${match ? "geocoded; review required" : "not found"}`);
}
