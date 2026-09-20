"use client";

/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, GitCompareArrows, List, Map, Search, Settings, SlidersHorizontal, X } from "lucide-react";
import { formatWon, type Venue } from "@/lib/venues";
import { VenueCover } from "@/components/venue-cover";
import { NaverVenueMap } from "@/components/naver-venue-map";
import { Slider } from "@/components/ui/slider";
import { WelcomeDialog } from "@/components/welcome-dialog";

type ViewMode = "list" | "map";
type DayBasis = "weekday" | "friday" | "saturday" | "sunday";
type SortKey = "default" | "price" | "capacity" | "updated";
const PRICE_MAX = 3_000_000;
const DAY_LABEL: Record<DayBasis, string> = { weekday: "평일", friday: "금요일", saturday: "토요일", sunday: "일요일" };
const priceFor = (venue: Venue, day: DayBasis) => day === "weekday" ? venue.prices.weekdayMin : day === "friday" ? venue.prices.fridayMin ?? null : day === "saturday" ? venue.prices.saturdayMin ?? null : venue.prices.sundayMin ?? null;

function VenueImage({ venue, compact = false }: { venue: Venue; compact?: boolean }) {
  const image = venue.images?.[0];
  const [failed, setFailed] = useState(false);
  return image && !failed ? <img src={image} alt={`${venue.name} 공연장`} className={compact ? "venue-image venue-image-compact" : "venue-image"} onError={() => setFailed(true)} /> : <VenueCover name={venue.name} accent={venue.accent} compact={compact} />;
}

function VenueCard({ venue, dayBasis, selected, onSelect }: { venue: Venue; dayBasis: DayBasis; selected: boolean; onSelect: () => void }) {
  const price = priceFor(venue, dayBasis);
  const equipment = [venue.audio.console ? "오디오콘솔" : null, venue.backline.drums ? "드럼" : null, venue.backline.guitarAmp ? "기타앰프" : null].filter(Boolean).slice(0, 3);
  return <article className={`venue-card ${selected ? "venue-card-selected" : ""}`}>
    <a href={`/venues/${venue.slug}`} className="venue-card-media" aria-label={`${venue.name} 상세보기`}><VenueImage venue={venue} /></a>
    <div className="venue-card-body">
      <div className="venue-card-title-row"><div><p className="venue-area">{venue.area}</p><a href={`/venues/${venue.slug}`} className="venue-name">{venue.name}</a></div><button onClick={onSelect} className={`compare-check ${selected ? "compare-check-active" : ""}`} aria-label={selected ? "비교에서 제외" : "비교에 추가"}>{selected ? <Check /> : <GitCompareArrows />}</button></div>
      <p className="venue-station">{venue.nearestStation.split("/")[0]}</p>
      <div className="venue-core"><span>{venue.capacity ? `${venue.capacity.toLocaleString("ko-KR")}명` : "수용 인원 확인 필요"}</span><strong>{price === null ? `${DAY_LABEL[dayBasis]} 가격 문의` : `${DAY_LABEL[dayBasis]} ${formatWon(price)}부터`}</strong></div>
      <div className="venue-tags">{venue.staff.soundEngineer === true && <span>음향 엔지니어 포함</span>}{venue.staff.lightingOperator === true && <span>조명 엔지니어 포함</span>}{equipment.map((item) => <span key={item}>{item}</span>)}</div>
      <a href={`/venues/${venue.slug}`} className="venue-detail-link">상세보기</a>
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
    ["음향 엔지니어", (v) => v.staff.soundEngineer === true ? "포함" : "확인 필요"], ["조명 엔지니어", (v) => v.staff.lightingOperator === true ? "포함" : "확인 필요"],
    ["오디오콘솔", (v) => v.audio.console ?? "확인 필요"], ["메인 PA", (v) => v.audio.mainPa ?? "확인 필요"],
    ["모니터", (v) => v.audio.monitor ?? "확인 필요"], ["드럼", (v) => v.backline.drums ?? "확인 필요"],
    ["기타앰프", (v) => v.backline.guitarAmp ?? "확인 필요"], ["베이스앰프", (v) => v.backline.bassAmp ?? "확인 필요"],
  ];
  return <div className="compare-overlay" role="dialog" aria-modal="true" aria-label="공연장 비교"><div className="compare-dialog"><header><div><span>MATRIX COMPARE</span><h2>공연장 {selected.length}곳 비교</h2></div><button onClick={close} aria-label="비교 닫기"><X /></button></header><div className="compare-table-wrap"><table><thead><tr><th>비교 항목</th>{selected.map((v) => <th key={v.slug}>{v.name}</th>)}</tr></thead><tbody>{rows.map(([label, getValue]) => <tr key={label}><th>{label}</th>{selected.map((v) => <td key={v.slug}>{getValue(v)}</td>)}</tr>)}</tbody></table></div></div></div>;
}

export function VenueExplorer({ initialVenues, naverMapClientId, initialFilters = {} }: { initialVenues: Venue[]; naverMapClientId: string; initialFilters?: Record<string, string> }) {
  const flag = (key: string) => initialFilters[key] === "true";
  const parsedMaxPrice = Number(initialFilters.maxPrice);
  const hasCapacityData = initialVenues.some((venue) => venue.capacity !== null);
  const [view, setView] = useState<ViewMode>(initialFilters.view === "map" ? "map" : "list");
  const [query, setQuery] = useState(initialFilters.q ?? "");
  const [area, setArea] = useState(initialFilters.area ?? "전체");
  const [dayBasis, setDayBasis] = useState<DayBasis>((["weekday", "friday", "saturday", "sunday"].includes(initialFilters.day) ? initialFilters.day : "saturday") as DayBasis);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice !== undefined && Number.isFinite(parsedMaxPrice) ? Math.max(0, Math.min(parsedMaxPrice, PRICE_MAX)) : PRICE_MAX);
  const [capacityMin, setCapacityMin] = useState(hasCapacityData && Number(initialFilters.capacityMin) > 0 ? Number(initialFilters.capacityMin) : 0);
  const [engineer, setEngineer] = useState(flag("engineer"));
  const [drums, setDrums] = useState(flag("drums"));
  const [guitarAmp, setGuitarAmp] = useState(flag("guitarAmp"));
  const [bassAmp, setBassAmp] = useState(flag("bassAmp"));
  const [parking, setParking] = useState(flag("parking"));
  const [waitingRoom, setWaitingRoom] = useState(flag("waitingRoom"));
  const [consoleOnly, setConsoleOnly] = useState(flag("console"));
  const [sort, setSort] = useState<SortKey>((["price", "capacity", "updated"].includes(initialFilters.sort) ? initialFilters.sort : "default") as SortKey);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const areas = useMemo(() => ["전체", ...Array.from(new Set(initialVenues.map((venue) => venue.area)))], [initialVenues]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query); if (area !== "전체") params.set("area", area); if (dayBasis !== "saturday") params.set("day", dayBasis);
    if (maxPrice < PRICE_MAX) params.set("maxPrice", String(maxPrice)); if (hasCapacityData && capacityMin > 0) params.set("capacityMin", String(capacityMin));
    if (engineer) params.set("engineer", "true"); if (drums) params.set("drums", "true"); if (guitarAmp) params.set("guitarAmp", "true"); if (bassAmp) params.set("bassAmp", "true");
    if (parking) params.set("parking", "true"); if (waitingRoom) params.set("waitingRoom", "true"); if (consoleOnly) params.set("console", "true");
    if (sort !== "default") params.set("sort", sort); if (view !== "list") params.set("view", view);
    const next = `${window.location.pathname}${params.size ? `?${params}` : ""}`; window.history.replaceState(null, "", next);
  }, [query, area, dayBasis, maxPrice, capacityMin, hasCapacityData, engineer, drums, guitarAmp, bassAmp, parking, waitingRoom, consoleOnly, sort, view]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = initialVenues.filter((venue) => {
      const price = priceFor(venue, dayBasis);
      const searchable = [venue.name, venue.area, venue.neighborhood, venue.address, venue.nearestStation].filter(Boolean).join(" ").toLowerCase();
      return (!normalized || searchable.includes(normalized)) && (area === "전체" || venue.area === area) && (!hasCapacityData || capacityMin === 0 || (venue.capacity !== null && venue.capacity >= capacityMin)) && (!engineer || venue.staff.soundEngineer === true) && (!drums || Boolean(venue.backline.drums)) && (!guitarAmp || Boolean(venue.backline.guitarAmp)) && (!bassAmp || Boolean(venue.backline.bassAmp)) && (!parking || venue.facilities.parking === true) && (!waitingRoom || venue.facilities.waitingRoom === true) && (!consoleOnly || Boolean(venue.audio.console)) && (maxPrice >= PRICE_MAX || (price !== null && price <= maxPrice));
    });
    return [...list].sort((a, b) => sort === "price" ? (priceFor(a, dayBasis) ?? Infinity) - (priceFor(b, dayBasis) ?? Infinity) : sort === "capacity" ? (b.capacity ?? -1) - (a.capacity ?? -1) : sort === "updated" ? (b.lastCheckedAt ?? "").localeCompare(a.lastCheckedAt ?? "") : initialVenues.indexOf(a) - initialVenues.indexOf(b));
  }, [initialVenues, query, area, dayBasis, maxPrice, capacityMin, hasCapacityData, engineer, drums, guitarAmp, bassAmp, parking, waitingRoom, consoleOnly, sort]);
  const selected = selectedSlugs.map((slug) => initialVenues.find((venue) => venue.slug === slug)).filter(Boolean) as Venue[];
  const priceActive = maxPrice < PRICE_MAX;
  const activeCount = Number(Boolean(query)) + Number(area !== "전체") + Number(priceActive) + Number(hasCapacityData && capacityMin > 0) + Number(engineer) + Number(drums) + Number(guitarAmp) + Number(bassAmp) + Number(parking) + Number(waitingRoom) + Number(consoleOnly);
  const reset = () => { setQuery(""); setArea("전체"); setDayBasis("saturday"); setMaxPrice(PRICE_MAX); setCapacityMin(0); setEngineer(false); setDrums(false); setGuitarAmp(false); setBassAmp(false); setParking(false); setWaitingRoom(false); setConsoleOnly(false); setSort("default"); };
  const toggleSelected = (slug: string) => setSelectedSlugs((current) => current.includes(slug) ? current.filter((item) => item !== slug) : current.length < 4 ? [...current, slug] : current);

  const dayOptions = <><option value="weekday">평일(월–목)</option><option value="friday">금요일</option><option value="saturday">토요일</option><option value="sunday">일요일</option></>;
  const filters = <><label className="filter-select">지역<select value={area} onChange={(event) => setArea(event.target.value)}>{areas.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown /></label><label className="filter-select">가격 기준<select value={dayBasis} onChange={(event) => setDayBasis(event.target.value as DayBasis)}>{dayOptions}</select><ChevronDown /></label><label className="filter-select" title={hasCapacityData ? undefined : "등록된 수용 인원 정보가 없습니다."}>최소 인원<select value={capacityMin} disabled={!hasCapacityData} onChange={(event) => setCapacityMin(Number(event.target.value))}>{hasCapacityData ? <><option value="0">전체</option><option value="50">50명</option><option value="100">100명</option><option value="150">150명</option><option value="300">300명</option></> : <option value="0">인원 정보 없음</option>}</select><ChevronDown /></label><div className="price-filter-popover"><PriceControl value={maxPrice} onChange={setMaxPrice} /></div><button className={`filter-button ${engineer ? "selected" : ""}`} onClick={() => setEngineer(!engineer)}>음향 엔지니어</button><button className={`filter-button ${drums ? "selected" : ""}`} onClick={() => setDrums(!drums)}>드럼</button><button className={`filter-button ${guitarAmp ? "selected" : ""}`} onClick={() => setGuitarAmp(!guitarAmp)}>기타앰프</button><button className={`filter-button ${bassAmp ? "selected" : ""}`} onClick={() => setBassAmp(!bassAmp)}>베이스앰프</button><button className={`filter-button ${consoleOnly ? "selected" : ""}`} onClick={() => setConsoleOnly(!consoleOnly)}>오디오콘솔</button><button className={`filter-button ${parking ? "selected" : ""}`} onClick={() => setParking(!parking)}>주차</button>{activeCount > 0 && <button className="filter-reset" onClick={reset}>전체 초기화</button>}</>;

  return <div className="matrix-page">
    <header className="matrix-header"><div className="matrix-header-inner"><a href="/" className="matrix-logo"><span>M</span>MATRIX</a><label className="matrix-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="공연장명, 지역, 역 또는 주소 검색" /></label><a href="/admin" className="admin-link"><Settings />관리자</a></div></header>
    <div className="matrix-filter-bar"><div className="matrix-filter-inner"><button className="mobile-filter-button" onClick={() => setMobileFilters(true)}><SlidersHorizontal />필터{activeCount > 0 && <b>{activeCount}</b>}</button><div className="desktop-filters">{filters}</div><div className="view-switch"><button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><List />목록</button><button className={view === "map" ? "active" : ""} onClick={() => setView("map")}><Map />지도</button></div></div></div>
    <main className="matrix-main"><div className="result-head"><div><p>홍대 · 합정 · 상수 · 망원</p><h1>공연장 {filtered.length}곳</h1></div><label className="sort-control">정렬<select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}><option value="default">기본순</option><option value="price">가격 낮은순</option><option value="capacity">수용 인원 많은순</option><option value="updated">최근 업데이트순</option></select><ChevronDown /></label></div>
      {filtered.length === 0 ? <div className="matrix-empty"><Search /><h2>조건에 맞는 공연장이 없습니다.</h2><p>필터를 줄이거나 검색어를 바꿔보세요.</p><button onClick={reset}>필터 초기화</button></div> : view === "list" ? <div className="venue-grid">{filtered.map((venue) => <VenueCard key={venue.slug} venue={venue} dayBasis={dayBasis} selected={selectedSlugs.includes(venue.slug)} onSelect={() => toggleSelected(venue.slug)} />)}</div> : <div className="map-split"><div className="map-list">{filtered.map((venue) => { const price = priceFor(venue, dayBasis); return <div className="map-list-item" key={venue.slug}><a href={`/venues/${venue.slug}`}><VenueImage venue={venue} compact /></a><div><p>{venue.area}</p><a href={`/venues/${venue.slug}`}>{venue.name}</a><span>{price === null ? "가격 문의" : `${formatWon(price)}부터`}</span></div></div>; })}</div><NaverVenueMap venues={filtered} clientId={naverMapClientId} /></div>}
    </main>
    <footer className="matrix-footer"><strong>MATRIX</strong><span>공연장 대관 및 기술 정보 검색</span></footer>
    {selected.length > 0 && <div className="compare-bar"><div><strong>{selected.length}곳 선택</strong><span>2~4곳을 선택해 비교하세요</span></div><div><button onClick={() => setSelectedSlugs([])}>초기화</button><button disabled={selected.length < 2} onClick={() => setCompareOpen(true)}>비교하기</button></div></div>}
    {compareOpen && <Comparison selected={selected} close={() => setCompareOpen(false)} />}
    {mobileFilters && <div className="mobile-sheet-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setMobileFilters(false)}><div className="mobile-sheet"><header><h2>필터</h2><button onClick={() => setMobileFilters(false)}><X /></button></header><label>지역<select value={area} onChange={(event) => setArea(event.target.value)}>{areas.map((item) => <option key={item}>{item}</option>)}</select></label><label>가격 기준<select value={dayBasis} onChange={(event) => setDayBasis(event.target.value as DayBasis)}>{dayOptions}</select></label><label>최소 수용 인원<select value={capacityMin} disabled={!hasCapacityData} onChange={(event) => setCapacityMin(Number(event.target.value))}>{hasCapacityData ? <><option value="0">전체</option><option value="50">50명</option><option value="100">100명</option><option value="150">150명</option><option value="300">300명</option></> : <option value="0">인원 정보 없음</option>}</select></label><PriceControl value={maxPrice} onChange={setMaxPrice} /><div className="mobile-options"><button className={engineer ? "selected" : ""} onClick={() => setEngineer(!engineer)}>음향 엔지니어</button><button className={drums ? "selected" : ""} onClick={() => setDrums(!drums)}>드럼</button><button className={guitarAmp ? "selected" : ""} onClick={() => setGuitarAmp(!guitarAmp)}>기타앰프</button><button className={bassAmp ? "selected" : ""} onClick={() => setBassAmp(!bassAmp)}>베이스앰프</button><button className={consoleOnly ? "selected" : ""} onClick={() => setConsoleOnly(!consoleOnly)}>오디오콘솔</button><button className={parking ? "selected" : ""} onClick={() => setParking(!parking)}>주차</button><button className={waitingRoom ? "selected" : ""} onClick={() => setWaitingRoom(!waitingRoom)}>대기실</button></div><div className="mobile-sheet-actions"><button onClick={reset}>초기화</button><button onClick={() => setMobileFilters(false)}>{filtered.length}곳 보기</button></div></div></div>}
    <WelcomeDialog />
  </div>;
}
