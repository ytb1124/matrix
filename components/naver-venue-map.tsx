"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { formatWon, type Venue } from "@/lib/venues";
import { VenueCover } from "@/components/venue-cover";

type NaverMap = { setCenter: (position: unknown) => void };
type NaverMaps = {
  Map: new (element: HTMLElement, options: Record<string, unknown>) => NaverMap;
  LatLng: new (lat: number, lng: number) => unknown;
  Marker: new (options: Record<string, unknown>) => { setMap: (map: NaverMap | null) => void };
  Event: { addListener: (target: unknown, event: string, callback: () => void) => void };
};

declare global {
  interface Window { naver?: { maps: NaverMaps } }
}

export function NaverVenueMap({ venues, clientId }: { venues: Venue[]; clientId: string }) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<NaverMap | null>(null);
  const markers = useRef<Array<{ setMap: (map: NaverMap | null) => void }>>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<Venue | null>(null);
  const [previewImageFailed, setPreviewImageFailed] = useState(false);
  const selectedPrice = selected ? selected.prices.weekendMin ?? selected.prices.weekdayMin : null;
  const mapped = useMemo(() => venues.filter((venue) => venue.locationVerified && venue.latitude !== null && venue.longitude !== null), [venues]);
  const visibleSelected = selected && mapped.some((venue) => venue.slug === selected.slug) ? selected : null;

  useEffect(() => {
    if (!clientId) return;
    if (window.naver?.maps) { queueMicrotask(() => setReady(true)); return; }
    const existing = document.querySelector<HTMLScriptElement>("script[data-matrix-naver-map]");
    const handleLoad = () => setReady(true);
    const handleError = () => setLoadError(true);
    if (existing) { existing.addEventListener("load", handleLoad); existing.addEventListener("error", handleError); return () => { existing.removeEventListener("load", handleLoad); existing.removeEventListener("error", handleError); }; }
    const script = document.createElement("script");
    script.dataset.matrixNaverMap = "true";
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.async = true;
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    document.head.appendChild(script);
    return () => { script.removeEventListener("load", handleLoad); script.removeEventListener("error", handleError); };
  }, [clientId]);

  useEffect(() => {
    if (!ready || !window.naver?.maps || !mapElement.current) return;
    const maps = window.naver.maps;
    const centerVenue = mapped[0];
    const center = centerVenue ? new maps.LatLng(centerVenue.latitude as number, centerVenue.longitude as number) : new maps.LatLng(37.5665, 126.9780);
    const map = new maps.Map(mapElement.current, { center, zoom: centerVenue ? 14 : 11, minZoom: 9, zoomControl: true, zoomControlOptions: { position: 3 } });
    mapInstance.current = map;
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = mapped.map((venue) => {
      const marker = new maps.Marker({ position: new maps.LatLng(venue.latitude as number, venue.longitude as number), map, title: venue.name });
      maps.Event.addListener(marker, "click", () => { setPreviewImageFailed(false); setSelected(venue); });
      return marker;
    });
    return () => { markers.current.forEach((marker) => marker.setMap(null)); markers.current = []; };
  }, [ready, mapped]);

  if (!clientId) return <MapNotice title={process.env.NODE_ENV === "development" ? "Naver Maps Client ID가 필요합니다" : "지도를 준비 중입니다"} body={process.env.NODE_ENV === "development" ? "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 설정해 주세요." : "현재 지도 정보를 불러올 수 없습니다. 목록에서 공연장을 확인해 주세요."} />;
  if (loadError) return <MapNotice title="지도를 불러오지 못했습니다" body="Naver Maps Client ID와 Web Service URL 등록을 확인해 주세요." />;

  return (
    <div className="matrix-map-shell">
      <div ref={mapElement} className="matrix-map" aria-label="공연장 네이버 지도" />
      {ready && mapped.length === 0 && <div className="matrix-map-empty"><MapPin /><strong>표시할 검증 좌표가 없습니다</strong><span>주소 geocoding 검토가 끝난 공연장만 지도에 표시됩니다.</span></div>}
      {visibleSelected && <div className="map-preview">
        {visibleSelected.images?.[0] && !previewImageFailed ? <img src={visibleSelected.images[0]} alt={`${visibleSelected.name} 공연장`} onError={() => setPreviewImageFailed(true)} /> : <VenueCover name={visibleSelected.name} accent={visibleSelected.accent} compact />}
        <div><button className="map-preview-close" onClick={() => setSelected(null)} aria-label="미리보기 닫기">×</button><p className="map-preview-area">{visibleSelected.area}</p><h3>{visibleSelected.name}</h3>{visibleSelected.capacity && <p>{visibleSelected.capacity.toLocaleString("ko-KR")}명</p>}<p className="map-preview-price">{selectedPrice === null ? "가격 문의" : `${formatWon(selectedPrice)}부터`}</p><a href={`/venues/${visibleSelected.slug}`}>상세보기</a></div>
      </div>}
    </div>
  );
}

function MapNotice({ title, body }: { title: string; body: string }) {
  return <div className="matrix-map-notice"><MapPin /><strong>{title}</strong><span>{body}</span></div>;
}
