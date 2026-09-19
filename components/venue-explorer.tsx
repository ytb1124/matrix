"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AudioLines,
  Check,
  ChevronDown,
  CircleAlert,
  GitCompareArrows,
  List,
  Map,
  MapPin,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { formatWon, venues, type Venue } from "@/lib/venues";
import { VenueCover } from "@/components/venue-cover";

type ViewMode = "list" | "map";
type DayBasis = "weekday" | "weekend";
type SortKey = "default" | "price" | "capacity" | "updated";

const areas = ["전체", ...Array.from(new Set(venues.map((venue) => venue.area)))];

function StatusBadge({ value, children }: { value: boolean | null; children: React.ReactNode }) {
  if (!value) return null;
  return <span className="badge badge-positive"><Check className="h-3 w-3" />{children}</span>;
}

function VenueCard({ venue, selected, onSelect }: { venue: Venue; selected: boolean; onSelect: () => void }) {
  const keyPrice = venue.prices.weekdayMin ?? venue.prices.weekendMin;
  return (
    <article className="venue-card group">
      <Link href={`/venues/${venue.slug}`} className="block overflow-hidden rounded-t-[18px]" aria-label={`${venue.name} 상세보기`}>
        <VenueCover name={venue.name} accent={venue.accent} />
      </Link>
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold text-violet-700">{venue.area}</p>
            <Link href={`/venues/${venue.slug}`} className="line-clamp-1 text-[19px] font-bold tracking-[-0.02em] text-slate-950 hover:text-violet-700">{venue.name}</Link>
          </div>
          <button onClick={onSelect} className={`compare-check ${selected ? "compare-check-active" : ""}`} aria-label={selected ? "비교에서 제외" : "비교에 추가"}>
            {selected ? <Check className="h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />}
          </button>
        </div>
        <div className="space-y-1.5 text-sm text-slate-600">
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-slate-400" />{venue.nearestStation.split("/")[0]}</p>
          <p className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0 text-slate-400" />수용 인원 확인 필요</p>
          <p className="flex items-center gap-2"><AudioLines className="h-4 w-4 shrink-0 text-slate-400" />{venue.audio.console ?? "콘솔 정보 확인 필요"}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <StatusBadge value={venue.staff.soundEngineer}>음향 엔지니어</StatusBadge>
          <StatusBadge value={Boolean(venue.backline.drums)}>Drum</StatusBadge>
          {venue.audio.diBox && venue.audio.diBox !== "없음" && <span className="badge">DI Box</span>}
          {venue.verificationStatus === "unverified" && <span className="badge badge-warning">검증 필요</span>}
        </div>
        <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500">대표 대관료</p>
            <p className="mt-0.5 font-bold text-slate-950">{formatWon(keyPrice)}<span className="ml-1 text-xs font-medium text-slate-400">부터</span></p>
          </div>
          <Link href={`/venues/${venue.slug}`} className="text-sm font-bold text-violet-700 hover:text-violet-900">상세보기</Link>
        </div>
      </div>
    </article>
  );
}

function Comparison({ selected, close }: { selected: Venue[]; close: () => void }) {
  const rows: { label: string; value: (venue: Venue) => React.ReactNode }[] = [
    { label: "지역", value: (venue) => venue.area },
    { label: "수용 인원", value: () => "확인 필요" },
    { label: "평일 대관료", value: (venue) => venue.prices.weekday ?? "확인 필요" },
    { label: "주말 대관료", value: (venue) => venue.prices.weekend ?? "확인 필요" },
    { label: "음향 엔지니어", value: (venue) => venue.staff.soundEngineer === true ? "포함" : "확인 필요" },
    { label: "FOH Console", value: (venue) => venue.audio.console ?? "확인 필요" },
    { label: "Main PA", value: (venue) => venue.audio.mainPa ?? "확인 필요" },
    { label: "Monitor", value: (venue) => venue.audio.monitor ?? "확인 필요" },
    { label: "Drum", value: (venue) => venue.backline.drums ?? "확인 필요" },
    { label: "Guitar Amp", value: (venue) => venue.backline.guitarAmp ?? "확인 필요" },
    { label: "Parking", value: () => "확인 필요" },
  ];
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/55 p-3 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label="공연장 비교">
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:px-7">
          <div><p className="text-xs font-bold text-violet-700">VENUE COMPARE</p><h2 className="text-xl font-black">공연장 {selected.length}곳 비교</h2></div>
          <button onClick={close} className="icon-button" aria-label="비교 닫기"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-auto">
          <table className="min-w-[760px] w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-slate-950 text-white">
              <tr><th className="w-36 p-4">비교 항목</th>{selected.map((venue) => <th key={venue.slug} className="min-w-56 p-4 text-base">{venue.name}</th>)}</tr>
            </thead>
            <tbody>{rows.map((row) => <tr key={row.label} className="border-b border-slate-100 align-top"><th className="bg-slate-50 p-4 text-slate-500">{row.label}</th>{selected.map((venue) => <td key={venue.slug} className="p-4 leading-6 text-slate-800">{row.value(venue)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function VenueExplorer() {
  const [view, setView] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("전체");
  const [dayBasis, setDayBasis] = useState<DayBasis>("weekend");
  const [maxPrice, setMaxPrice] = useState("");
  const [engineer, setEngineer] = useState(false);
  const [drums, setDrums] = useState(false);
  const [consoleOnly, setConsoleOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("default");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const limit = maxPrice ? Number(maxPrice) * 10000 : null;
    const list = venues.filter((venue) => {
      const price = dayBasis === "weekday" ? venue.prices.weekdayMin : venue.prices.weekendMin;
      const text = [venue.name, venue.area, venue.address, venue.nearestStation].join(" ").toLowerCase();
      return (!normalized || text.includes(normalized)) &&
        (area === "전체" || venue.area === area) &&
        (!engineer || venue.staff.soundEngineer === true) &&
        (!drums || Boolean(venue.backline.drums)) &&
        (!consoleOnly || Boolean(venue.audio.console)) &&
        (limit === null || (price !== null && price <= limit));
    });
    return [...list].sort((a, b) => {
      if (sort === "price") return (a.prices[`${dayBasis}Min`] ?? Infinity) - (b.prices[`${dayBasis}Min`] ?? Infinity);
      if (sort === "capacity") return (b.capacity ?? -1) - (a.capacity ?? -1);
      if (sort === "updated") return (b.lastCheckedAt ?? "").localeCompare(a.lastCheckedAt ?? "");
      return venues.indexOf(a) - venues.indexOf(b);
    });
  }, [query, area, dayBasis, maxPrice, engineer, drums, consoleOnly, sort]);

  const selected = selectedSlugs.map((slug) => venues.find((venue) => venue.slug === slug)).filter(Boolean) as Venue[];
  const activeCount = Number(area !== "전체") + Number(Boolean(maxPrice)) + Number(engineer) + Number(drums) + Number(consoleOnly);
  const reset = () => { setArea("전체"); setMaxPrice(""); setEngineer(false); setDrums(false); setConsoleOnly(false); };
  const toggleSelected = (slug: string) => setSelectedSlugs((current) => current.includes(slug) ? current.filter((item) => item !== slug) : current.length < 4 ? [...current, slug] : current);

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1540px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-700 text-white shadow-lg shadow-violet-200"><AudioLines className="h-5 w-5" /></span><span className="hidden text-lg font-black tracking-[-0.04em] sm:block">STAGE INDEX</span></Link>
          <label className="relative mx-auto block w-full max-w-2xl"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-[15px] outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100" placeholder="공연장명, 지역, 역 또는 주소 검색" /></label>
          <a href="#data-note" className="hidden shrink-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 lg:block">데이터 안내</a>
        </div>
        <div className="border-t border-slate-100">
          <div className="mx-auto flex max-w-[1540px] items-center gap-2 overflow-x-auto px-4 py-3 scrollbar-none sm:px-6 lg:px-8">
            <button className="filter-chip lg:hidden" onClick={() => setMobileFilters(true)}><SlidersHorizontal className="h-4 w-4" />필터 {activeCount > 0 && <b>{activeCount}</b>}</button>
            <label className="filter-chip hidden lg:flex">지역<select value={area} onChange={(event) => setArea(event.target.value)}>{areas.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown className="h-4 w-4" /></label>
            <label className="filter-chip hidden lg:flex">기준<select value={dayBasis} onChange={(event) => setDayBasis(event.target.value as DayBasis)}><option value="weekday">평일</option><option value="weekend">주말</option></select><ChevronDown className="h-4 w-4" /></label>
            <label className="filter-chip hidden lg:flex">최대<input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="금액" className="w-16 bg-transparent text-right outline-none" />만원</label>
            <button className={`filter-chip hidden lg:flex ${engineer ? "filter-chip-active" : ""}`} onClick={() => setEngineer(!engineer)}>엔지니어</button>
            <button className={`filter-chip hidden lg:flex ${drums ? "filter-chip-active" : ""}`} onClick={() => setDrums(!drums)}>Drum</button>
            <button className={`filter-chip hidden lg:flex ${consoleOnly ? "filter-chip-active" : ""}`} onClick={() => setConsoleOnly(!consoleOnly)}>Console</button>
            {activeCount > 0 && <button onClick={reset} className="ml-1 whitespace-nowrap text-sm font-semibold text-slate-500 hover:text-slate-900">전체 초기화</button>}
            <div className="ml-auto flex shrink-0 rounded-xl bg-slate-100 p-1">
              <button onClick={() => setView("list")} className={`view-toggle ${view === "list" ? "view-toggle-active" : ""}`}><List className="h-4 w-4" />목록</button>
              <button onClick={() => setView("map")} className={`view-toggle ${view === "map" ? "view-toggle-active" : ""}`}><Map className="h-4 w-4" />지도</button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-sm font-semibold text-violet-700">HONGDAE · HAPJEONG · SANGSU</p><h1 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-3xl">조건에 맞는 공연장 {filtered.length}곳</h1></div>
          <label className="sort-select">정렬<select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}><option value="default">기본순</option><option value="price">가격 낮은순</option><option value="capacity">수용 인원 많은순</option><option value="updated">최근 업데이트순</option></select><ChevronDown className="h-4 w-4" /></label>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-panel"><Search className="h-9 w-9 text-slate-300" /><h2>조건에 맞는 공연장이 없습니다</h2><p>필터를 줄이거나 검색어를 바꿔보세요.</p><button onClick={reset} className="primary-button">필터 초기화</button></div>
        ) : view === "list" ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{filtered.map((venue) => <VenueCard key={venue.slug} venue={venue} selected={selectedSlugs.includes(venue.slug)} onSelect={() => toggleSelected(venue.slug)} />)}</div>
        ) : (
          <div className="map-layout">
            <div className="map-results scrollbar-thin">{filtered.map((venue) => <Link key={venue.slug} href={`/venues/${venue.slug}`} className="map-result"><VenueCover name={venue.name} accent={venue.accent} compact /><div className="p-3"><p className="font-bold">{venue.name}</p><p className="mt-1 text-xs text-slate-500">{venue.area} · {venue.audio.console ?? "콘솔 확인 필요"}</p><p className="mt-2 text-sm font-bold text-violet-700">{formatWon(venue.prices.weekendMin ?? venue.prices.weekdayMin)}부터</p></div></Link>)}</div>
            <div className="map-canvas">
              <div className="map-grid" />
              <div className="relative z-10 max-w-md rounded-[22px] border border-slate-200 bg-white/95 p-6 text-center shadow-xl backdrop-blur">
                <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700"><MapPin className="h-6 w-6" /></span>
                <h2 className="text-xl font-black">좌표 등록 대기 중</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">엑셀에 주소는 있지만 위도·경도가 없습니다. 임의 위치를 표시하지 않고, 검증된 좌표가 들어오면 같은 필터 결과가 지도 마커로 표시되도록 구조를 준비했습니다.</p>
                <div className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-slate-700"><CircleAlert className="h-4 w-4 text-amber-600" />현재 {filtered.length}곳 모두 좌표 확인 필요</div>
              </div>
            </div>
          </div>
        )}

        <section id="data-note" className="mt-12 rounded-[22px] border border-slate-200 bg-white p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-sm font-bold text-amber-700">데이터 상태</p><h2 className="mt-1 text-xl font-black">가격·장비 정보는 원본 조사표를 기준으로 표시합니다</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">수용 인원, 좌표, 최근 확인일이 비어 있는 항목은 “확인 필요”로 표시했습니다. 대관 전 공연장 공식 채널에서 최신 조건을 다시 확인해 주세요.</p></div><span className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">원본 공연장 8곳</span></div>
        </section>
      </main>

      {selected.length > 0 && <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl bg-slate-950 p-3 pl-4 text-white shadow-2xl sm:bottom-6"><div><p className="text-sm font-bold">{selected.length}곳 선택</p><p className="text-xs text-slate-400">2~4곳을 선택해 비교하세요</p></div><div className="flex gap-2"><button onClick={() => setSelectedSlugs([])} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-300">초기화</button><button disabled={selected.length < 2} onClick={() => setCompareOpen(true)} className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-40">비교하기</button></div></div>}
      {compareOpen && <Comparison selected={selected} close={() => setCompareOpen(false)} />}

      {mobileFilters && <div className="fixed inset-0 z-50 bg-slate-950/50 lg:hidden" onMouseDown={(event) => event.target === event.currentTarget && setMobileFilters(false)}><div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-auto rounded-t-[26px] bg-white p-5 pb-8"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-black">필터</h2><button className="icon-button" onClick={() => setMobileFilters(false)}><X className="h-5 w-5" /></button></div><div className="space-y-5"><label className="mobile-field">지역<select value={area} onChange={(event) => setArea(event.target.value)}>{areas.map((item) => <option key={item}>{item}</option>)}</select></label><label className="mobile-field">가격 기준<select value={dayBasis} onChange={(event) => setDayBasis(event.target.value as DayBasis)}><option value="weekday">평일</option><option value="weekend">주말</option></select></label><label className="mobile-field">최대 대관료 (만원)<input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="예: 100" /></label><div><p className="mb-2 text-sm font-bold">운영·장비 조건</p><div className="grid grid-cols-2 gap-2"><button className={`mobile-option ${engineer ? "mobile-option-active" : ""}`} onClick={() => setEngineer(!engineer)}>음향 엔지니어</button><button className={`mobile-option ${drums ? "mobile-option-active" : ""}`} onClick={() => setDrums(!drums)}>Drum</button><button className={`mobile-option ${consoleOnly ? "mobile-option-active" : ""}`} onClick={() => setConsoleOnly(!consoleOnly)}>Console</button></div></div></div><div className="mt-7 grid grid-cols-[1fr_2fr] gap-2"><button onClick={reset} className="secondary-button">초기화</button><button onClick={() => setMobileFilters(false)} className="primary-button">{filtered.length}곳 보기</button></div></div></div>}
    </div>
  );
}

