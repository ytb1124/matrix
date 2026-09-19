/** Geocode only records with a normalized address and no coordinates.
 * Requires KAKAO_REST_API_KEY. Review the generated file before importing it.
 */
import { readFile, writeFile } from "node:fs/promises";

type VenueRow = { slug: string; address_normalized?: string | null; address_display: string; latitude?: number | null; longitude?: number | null };

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) throw new Error("usage: tsx scripts/geocode-venues.ts venues.json geocoded.json");
const apiKey = process.env.KAKAO_REST_API_KEY;
if (!apiKey) throw new Error("KAKAO_REST_API_KEY is required");
const rows = JSON.parse(await readFile(inputPath, "utf8")) as VenueRow[];
const results = [];
for (const row of rows) {
  if (row.latitude != null && row.longitude != null) { results.push(row); continue; }
  const query = row.address_normalized || row.address_display;
  const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`, { headers: { Authorization: `KakaoAK ${apiKey}` } });
  if (!response.ok) throw new Error(`Kakao geocoding failed for ${row.slug}: ${response.status}`);
  const body = await response.json() as { documents?: Array<{ x: string; y: string; address_name: string }> };
  const match = body.documents?.[0];
  results.push({ ...row, latitude: match ? Number(match.y) : null, longitude: match ? Number(match.x) : null, geocoding_match: match?.address_name ?? null, geocoding_status: match ? "needs_review" : "not_found" });
}
await writeFile(outputPath, JSON.stringify(results, null, 2) + "\n", "utf8");

