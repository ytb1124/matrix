/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
/* eslint-disable @next/next/no-html-link-for-pages */
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import { formatWon } from "@/lib/venues";
import { getVenueBySlug, getVenues } from "@/lib/venue-data";
import { VenueCover } from "@/components/venue-cover";
import { CostCalculator } from "@/components/cost-calculator";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateStaticParams() { return (await getVenues()).map((venue) => ({ slug: venue.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const venue = await getVenueBySlug((await params).slug);
  return venue ? { title: `${venue.name} 대관·기술 정보 | MATRIX`, description: `${venue.name}의 대관료, 엔지니어, FOH, PA, 백라인 정보를 확인하세요.` } : {};
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return <div className="detail-field"><dt>{label}</dt><dd>{value}</dd></div>;
}

function Section({ title, rows }: { title: string; rows: Array<{ label: string; value: React.ReactNode }> }) {
  const visible = rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== "");
  if (!visible.length) return null;
  return <section className="detail-section"><h2>{title}</h2><dl>{visible.map((row) => <Field key={row.label} label={row.label} value={row.value} />)}</dl></section>;
}

function included(value: boolean | null | undefined) { return value === true ? "포함" : value === false ? "미포함" : null; }

export default async function VenueDetail({ params }: Props) {
  const venue = await getVenueBySlug((await params).slug);
  if (!venue) notFound();
  const representative = venue.prices.weekdayMin ?? venue.prices.weekendMin;
  const mainImage = venue.images?.[0];
  const facilities = [
    { label: "주차", value: included(venue.facilities.parking) }, { label: "대기실", value: included(venue.facilities.waitingRoom) },
    { label: "엘리베이터", value: included(venue.facilities.elevator) }, { label: "장비 반입", value: included(venue.facilities.easyLoadIn) },
    { label: "접근성", value: included(venue.facilities.accessibility) }, { label: "무대 크기", value: venue.stageSize },
  ];
  return <div className="matrix-detail-page">
    <header className="detail-topbar"><div><a href="/" className="detail-back"><ArrowLeft />목록으로</a><a href="/" className="matrix-logo"><span>M</span>MATRIX</a></div></header>
    <main className="detail-main">
      <div className="detail-hero">
        <div className="detail-image">{mainImage ? <img src={mainImage} alt={`${venue.name} 공연장`} /> : <VenueCover name={venue.name} accent={venue.accent} />}</div>
        <div className="detail-summary"><p className="detail-area">{venue.area}{venue.neighborhood ? ` · ${venue.neighborhood}` : ""}</p><h1>{venue.name}</h1><p className="detail-type">{venue.type}</p><p className="detail-address"><MapPin />{venue.address}</p><div className="detail-summary-grid">{venue.capacity && <div><span>수용 인원</span><strong>{venue.capacity.toLocaleString("ko-KR")}명</strong></div>}{representative !== null && <div><span>대표 대관료</span><strong>{formatWon(representative)}부터</strong></div>}{venue.staff.soundEngineer !== null && <div><span>FOH Engineer</span><strong>{venue.staff.soundEngineer ? "포함" : "미포함"}</strong></div>}{venue.audio.console && <div><span>FOH Console</span><strong>{venue.audio.console}</strong></div>}</div></div>
      </div>
      <div className="detail-layout"><div className="detail-content">
        <Section title="대관" rows={[{ label: "평일 대관료", value: venue.prices.weekday }, { label: "주말 대관료", value: venue.prices.weekend }, { label: "기본 대관시간", value: venue.prices.rentalHours }, { label: "부가세", value: venue.prices.taxIncluded === true ? "포함" : venue.prices.taxIncluded === false ? "별도" : null }, { label: "추가 조건", value: venue.prices.notes }]} />
        <Section title="인력" rows={[{ label: "음향 엔지니어", value: included(venue.staff.soundEngineer) }, { label: "모니터 엔지니어", value: included(venue.staff.monitorEngineer) }, { label: "조명 오퍼레이터", value: included(venue.staff.lightingOperator) }, { label: "무대 스태프", value: included(venue.staff.stageStaff) }, { label: "기본 포함", value: venue.staff.includedNotes }, { label: "추가 비용", value: venue.staff.extraFee }, { label: "비고", value: venue.staff.notes }]} />
        <Section title="음향" rows={[{ label: "FOH Console", value: venue.audio.console }, { label: "Main PA", value: venue.audio.mainPa }, { label: "Monitor", value: venue.audio.monitor }, { label: "유선 마이크", value: venue.audio.wiredMic }, { label: "무선 마이크", value: venue.audio.wirelessMic }, { label: "DI", value: venue.audio.diBox }]} />
        <Section title="백라인" rows={[{ label: "Drum", value: venue.backline.drums }, { label: "Guitar Amp", value: venue.backline.guitarAmp }, { label: "Bass Amp", value: venue.backline.bassAmp }, { label: "Keyboard / Piano", value: venue.backline.keyboard }, { label: "비고", value: venue.backline.notes }]} />
        <Section title="조명" rows={[{ label: "조명기", value: venue.lighting?.fixtures }, { label: "Moving Light", value: venue.lighting?.movingLights }, { label: "Follow Spot", value: venue.lighting?.followSpot }, { label: "Lighting Console", value: venue.lighting?.console }, { label: "비고", value: venue.lighting?.notes }]} />
        <Section title="시설" rows={facilities} />
      </div><aside className="detail-aside"><CostCalculator venue={venue} /><section className="detail-contact"><h2>연락처와 링크</h2>{venue.contact && <p>{venue.contact}</p>}{venue.officialUrl && <a href={venue.officialUrl} target="_blank" rel="noreferrer">홈페이지 / SNS<ExternalLink /></a>}</section><section className="detail-source"><h2>정보 출처</h2>{venue.sourceUrl && <a href={venue.sourceUrl} target="_blank" rel="noreferrer">조사 출처 보기<ExternalLink /></a>}{venue.lastCheckedAt && <p>마지막 확인일 <strong>{venue.lastCheckedAt}</strong></p>}{venue.geocodedAt && <p>주소 좌표 변환 <strong>{venue.geocodedAt}</strong></p>}</section></aside></div>
    </main><footer className="matrix-footer"><strong>MATRIX</strong><span>공연장 대관 및 기술 정보 검색</span></footer>
  </div>;
}
