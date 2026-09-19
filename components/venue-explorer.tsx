"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, GitCompareArrows, List, Map, Search, Settings, SlidersHorizontal, X } from "lucide-react";
import { formatWon, type Venue } from "@/lib/venues";
import { VenueCover } from "@/components/venue-cover";
import { NaverVenueMap } from "@/components/naver-venue-map";
import { Slider } from "@/components/ui/slider";

type ViewMode = "list" | "map";
type DayBasis = "weekday" | "weekend";
type SortKey = "default" | "price" | "capacity" | "updated";
const PRICE_MAX = 3_000_000;

function VenueImage({ venue, compact = false }: { venue: Venue; compact?: boolean }) {
  const image = venue.images?.[0];
  return image ? <img src={image} alt={`${venue.name} 공연장`} className={compact ? "venue-image venue-image-compact" : "venue-image"} /> : <VenueCover name={venue.name} accent={venue.accent} compact={compact} />;
}

function VenueCard({ venue, dayBasis, selected, onSelect }: { venue: Venue; dayBasis: DayBasis; selected: boolean; onSelect: () => void }) {
  const price = dayBasis === "weekday" ? venue.prices.weekdayMin : venue.prices.weekendMin;
  const equipment = [venue.audio.console, venue.backline.drums ? "Drum" : null, venue.backline.guitarAmp ? "Guitar Amp" : null].filter(Boolean).slice(0, 3);
  return <article className={`venue-card ${selected ? "venue-card-selected" : ""}`}>
    <Link href={`/venues/${venue.slug}`} className="venue-card-media" aria-label={`${venue.name} 상세보기`}><VenueImage venue={venue} /></Link>
    <div className="venue-card-body">
      <div className="venue-card-title-row"><div><p className="venue-area">{venue.area}</p><Link href={`/venues/${venue.slug}`} className="venue-name">{venue.name}</Link></div><button onClick={onSelect} className={`compare-check ${selected ? "compare-check-active" : ""}`} aria-label={selected ? "비교에서 제외" : "비교에 추가"}>{selected ? <Check /> : <GitCompareArrows />}</button></div>
      <p className="venue-station">{venue.nearestStation.split("/")[0]}</p>
      <div className="venue-core"><span>{venue.capacity ? `${venue.capacity.toLocaleString("ko-KR")}명` : "수용 인원 확인 필요"}</span><strong>{price === null ? `${dayBasis === "weekday" ? "평일" : "주말"} 가격 문의` : `${dayBasis === "weekday" ? "평일" : "주말"} ${formatWon(price)}부터`}</strong></div>
      <div className="venue-tags">{venue.staff.soundEngineer === true && <span>FOH Engineer 포함</span>}{equipment.map((item) => <span key={item}>{item}</span>)}</div>
      <Link href={`/venues/${venue.slug}`} className="venue-detail-link">상세보기</Link>
    </div>
  </article>;
}

function PriceControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <div className="price-control"><div className="price-control-head"><span>최대 대관료</span><strong>{value >= PRICE_MAX ? "3,000,000원+" : formatWon(value)}</strong></div><Slider min={0} max={PRICE_MAX} step={100_000} value={[value]} onValueChange={(next) => onChange(next[0] ?? PRICE_MAX)} aria-label="최대 대관료" /><div className="price-scale"><span>0원</span><span>3,000,000원+</span></div><p>선택한 기준일의 가격이 없으면 결과에서 제외됩니다.</p></div>;
}

function Comparison({ selected, close }: { selected: Venue[]; close: () => void }) {
  const rows: Array<[string, (venue: Venue) => React.ReactNode]> = [
    ["지역", (v) => v.area], ["수용 인원", (v) => v.capacity ? `${v.capacity}명` : "확인 필요"],
    ["평일 대관료", (v) => v.prices.weekday ?? "확인 필요"], ["주말 대관료", (v) => v.prices.weekend ?? "확인 필요"],
    ["음향 엔지니어", (v) => v.staff.soundEngineer === true ? "포함" : "확인 필요"], ["FOH Console", (v) => v.audio.console ?? "확인 필요"],
    ["Main PA", (v) => v.audio.mainPa ?? "확인 필요"], ["Monitor", (v) => v.audio.monitor ?? "확인 필요"],
    ["Drum", (v) => v.backline.drums ?? "확인 필요"], ["Guitar Amp", (v) => v.backline.guitarAmp ?? "확인 필요"],
  ];
  return <div className="compare-overlay" role="dialog" aria-modal="true" aria-label="공연장 비교"><div className="compare-dialog"><header><div><span>MATRIX COMPARE</span><h2>공연장 {selected.length}곳 비교</h2></div><button onClick={close} aria-label="비교 닫기"><X /></button></header><div className="compare-table-wrap"><table><thead><tr><th>비교 항목</th>{selected.map((v) => <th key={v.slug}>{v.name}</th>)}</tr></thead><tbody>{rows.map(([label, getValue]) => <tr key={label}><th>{label}</th>{selected.map((v) => <td key={v.slug}>{getValue(v)}</td>)}</tr>)}</tbody></table></div></div></div>;
}

export function VenueExplorer({ initialVenues, naverMapClientId }: { initialVenues: Venue[]; naverMapClientId: string }) {
  const [view, setView] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("전체");
  const [dayBasis, setDayBasis] = useState<DayBasis>("weekend");
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [engineer, setEngineer] = useState(false);
  const [drums, setDrums] = useState(false);
  const [consoleOnly, setConsoleOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("default");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const areas = useMemo(() => ["전체", ...Array.from(new Set(initialVenues.map((venue) => venue.area)))], [initialVenues]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = initialVenues.filter((venue) => {
      const price = dayBasis === "weekday" ? venue.prices.weekdayMin : venue.prices.weekendMin;
      const searchable = [venue.name, venue.area, venue.neighborhood, venue.address, venue.nearestStation].filter(Boolean).join(" ").toLowerCase();
      return (!normalized || searchable.includes(normalized)) && (area === "전체" || venue.area === area) && (!engineer || venue.staff.soundEngineer === true) && (!drums || Boolean(venue.backline.drums)) && (!consoleOnly || Boolean(venue.audio.console)) && (maxPrice >= PRICE_MAX || (price !== null && price <= maxPrice));
    });
    return [...list].sort((a, b) => sort === "price" ? ((dayBasis === "weekday" ? a.prices.weekdayMin : a.prices.weekendMin) ?? Infinity) - ((dayBasis === "weekday" ? b.prices.weekdayMin : b.prices.weekendMin) ?? Infinity) : sort === "capacity" ? (b.capacity ?? -1) - (a.capacity ?? -1) : sort === "updated" ? (b.lastCheckedAt ?? "").localeCompare(a.lastCheckedAt ?? "") : initialVenues.indexOf(a) - initialVenues.indexOf(b));
  }, [initialVenues, query, area, dayBasis, maxPrice, engineer, drums, consoleOnly, sort]);
  const selected = selectedSlugs.map((slug) => initialVenues.find((venue) => venue.slug === slug)).filter(Boolean) as Venue[];
  const priceActive = maxPrice < PRICE_MAX;
  const activeCount = Number(area !== "전체") + Number(priceActive) + Number(engineer) + Number(drums) + Number(consoleOnly);
  const reset = () => { setArea("전체"); setMaxPrice(PRICE_MAX); setEngineer(false); setDrums(false); setConsoleOnly(false); };
  const toggleSelected = (slug: string) => setSelectedSlugs((current) => current.includes(slug) ? current.filter((item) => item !== slug) : current.length < 4 ? [...current, slug] : current);

  const filters = <><label className="filter-select">지역<select value={area} onChange={(event) => setArea(event.target.value)}>{areas.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown /></label><label className="filter-select">가격 기준<select value={dayBasis} onChange={(event) => setDayBasis(event.target.value as DayBasis)}><option value="weekday">평일</option><option value="weekend">주말</option></select><ChevronDown /></label><div className="price-filter-popover"><PriceControl value={maxPrice} onChange={setMaxPrice} /></div><button className={`filter-button ${engineer ? "selected" : ""}`} onClick={() => setEngineer(!engineer)}>엔지니어</button><button className={`filter-button ${drums ? "selected" : ""}`} onClick={() => setDrums(!drums)}>Drum</button><button className={`filter-button ${consoleOnly ? "selected" : ""}`} onClick={() => setConsoleOnly(!consoleOnly)}>Console</button>{activeCount > 0 && <button className="filter-reset" onClick={reset}>전체 초기화</button>}</>;

  return <div className="matrix-page">
    <header className="matrix-header"><div className="matrix-header-inner"><Link href="/" className="matrix-logo"><span>M</span>MATRIX</Link><label className="matrix-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="공연장명, 지역, 역 또는 주소 검색" /></label><Link href="/admin" className="admin-link"><Settings />관리자</Link></div></header>
    <div className="matrix-filter-bar"><div className="matrix-filter-inner"><button className="mobile-filter-button" onClick={() => setMobileFilters(true)}><SlidersHorizontal />필터{activeCount > 0 && <b>{activeCount}</b>}</button><div className="desktop-filters">{filters}</div><div className="view-switch"><button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><List />목록</button><button className={view === "map" ? "active" : ""} onClick={() => setView("map")}><Map />지도</button></div></div></div>
    <main className="matrix-main"><div className="result-head"><div><p>홍대 · 합정 · 상수 · 망원</p><h1>공연장 {filtered.length}곳</h1></div><label className="sort-control">정렬<select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}><option value="default">기본순</option><option value="price">가격 낮은순</option><option value="capacity">수용 인원 많은순</option><option value="updated">최근 업데이트순</option></select><ChevronDown /></label></div>
      {filtered.length === 0 ? <div className="matrix-empty"><Search /><h2>조건에 맞는 공연장이 없습니다</h2><p>필터를 줄이거나 검색어를 바꿔보세요.</p><button onClick={reset}>필터 초기화</button></div> : view === "list" ? <div className="venue-grid">{filtered.map((venue) => <VenueCard key={venue.slug} venue={venue} dayBasis={dayBasis} selected={selectedSlugs.includes(venue.slug)} onSelect={() => toggleSelected(venue.slug)} />)}</div> : <div className="map-split"><div className="map-list">{filtered.map((venue) => { const price = dayBasis === "weekday" ? venue.prices.weekdayMin : venue.prices.weekendMin; return <div className="map-list-item" key={venue.slug}><Link href={`/venues/${venue.slug}`}><VenueImage venue={venue} compact /></Link><div><p>{venue.area}</p><Link href={`/venues/${venue.slug}`}>{venue.name}</Link><span>{price === null ? "가격 문의" : `${formatWon(price)}부터`}</span></div></div>; })}</div><NaverVenueMap venues={filtered} clientId={naverMapClientId} /></div>}
    </main>
    <footer className="matrix-footer"><strong>MATRIX</strong><span>공연장 대관 및 기술 정보 검색</span></footer>
    {selected.length > 0 && <div className="compare-bar"><div><strong>{selected.length}곳 선택</strong><span>2~4곳을 선택해 비교하세요</span></div><div><button onClick={() => setSelectedSlugs([])}>초기화</button><button disabled={selected.length < 2} onClick={() => setCompareOpen(true)}>비교하기</button></div></div>}
    {compareOpen && <Comparison selected={selected} close={() => setCompareOpen(false)} />}
    {mobileFilters && <div className="mobile-sheet-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setMobileFilters(false)}><div className="mobile-sheet"><header><h2>필터</h2><button onClick={() => setMobileFilters(false)}><X /></button></header><label>지역<select value={area} onChange={(event) => setArea(event.target.value)}>{areas.map((item) => <option key={item}>{item}</option>)}</select></label><label>가격 기준<select value={dayBasis} onChange={(event) => setDayBasis(event.target.value as DayBasis)}><option value="weekday">평일</option><option value="weekend">주말</option></select></label><PriceControl value={maxPrice} onChange={setMaxPrice} /><div className="mobile-options"><button className={engineer ? "selected" : ""} onClick={() => setEngineer(!engineer)}>음향 엔지니어</button><button className={drums ? "selected" : ""} onClick={() => setDrums(!drums)}>Drum</button><button className={consoleOnly ? "selected" : ""} onClick={() => setConsoleOnly(!consoleOnly)}>Console</button></div><div className="mobile-sheet-actions"><button onClick={reset}>초기화</button><button onClick={() => setMobileFilters(false)}>{filtered.length}곳 보기</button></div></div></div>}
  </div>;
}
