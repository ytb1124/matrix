import { VenueExplorer } from "@/components/venue-explorer";
import { getVenues } from "@/lib/venue-data";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const venues = await getVenues();
  const params = await searchParams;
  const initialFilters = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] ?? "" : value ?? ""]));
  const naverMapClientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? "";
  return <VenueExplorer initialVenues={venues} naverMapClientId={naverMapClientId} initialFilters={initialFilters} />;
}
