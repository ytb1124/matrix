import { VenueExplorer } from "@/components/venue-explorer";
import { getVenues } from "@/lib/venue-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const venues = await getVenues();
  const naverMapClientId = process.env.NAVER_MAP_CLIENT_ID ?? process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? "";
  return <VenueExplorer initialVenues={venues} naverMapClientId={naverMapClientId} />;
}
