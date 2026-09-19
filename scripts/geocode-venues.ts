/** Geocode records with Naver Maps only when their address hash changed.
 * Requires NAVER_MAPS_GEOCODING_CLIENT_ID and NAVER_MAPS_GEOCODING_CLIENT_SECRET.
 * Review every match before setting location_verified=true and importing it.
 */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

type VenueRow = { slug: string; address_normalized?: string | null; address_display: string; address_hash?: string | null; latitude?: number | null; longitude?: number | null; location_verified?: boolean; geocoded_at?: string | null };

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) throw new Error("usage: tsx scripts/geocode-venues.ts venues.json geocoded.json");
const clientId = process.env.NAVER_MAPS_GEOCODING_CLIENT_ID;
const clientSecret = process.env.NAVER_MAPS_GEOCODING_CLIENT_SECRET;
if (!clientId || !clientSecret) throw new Error("NAVER_MAPS_GEOCODING_CLIENT_ID and NAVER_MAPS_GEOCODING_CLIENT_SECRET are required");
const rows = JSON.parse(await readFile(inputPath, "utf8")) as VenueRow[];
const results = [];
for (const row of rows) {
  const query = row.address_normalized || row.address_display;
  const addressHash = createHash("sha256").update(query.trim()).digest("hex");
  if (row.address_hash === addressHash && row.latitude != null && row.longitude != null) { results.push(row); continue; }
  const response = await fetch(`https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`, { headers: { "x-ncp-apigw-api-key-id": clientId, "x-ncp-apigw-api-key": clientSecret } });
  if (!response.ok) throw new Error(`Naver geocoding failed for ${row.slug}: ${response.status}`);
  const body = await response.json() as { addresses?: Array<{ x: string; y: string; roadAddress: string; jibunAddress: string }> };
  const match = body.addresses?.[0];
  results.push({ ...row, address_hash: addressHash, latitude: match ? Number(match.y) : null, longitude: match ? Number(match.x) : null, location_verified: false, geocoded_at: match ? new Date().toISOString() : null, geocoded_address: match?.roadAddress || match?.jibunAddress || null, geocoding_status: match ? "needs_review" : "not_found" });
}
await writeFile(outputPath, JSON.stringify(results, null, 2) + "\n", "utf8");
