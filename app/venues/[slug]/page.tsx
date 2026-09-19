import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AudioLines, CalendarClock, Check, CircleAlert, ExternalLink, MapPin, Phone, Users } from "lucide-react";
import { formatWon, venueBySlug, venues } from "@/lib/venues";
import { VenueCover } from "@/components/venue-cover";
import { CostCalculator } from "@/components/cost-calculator";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return venues.map((venue) => ({ slug: venue.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const venue = venueBySlug(slug);
  if (!venue) return {};
  return { title: `${venue.name} 대관·장비 정보 | STAGE INDEX`, description: `${venue.name}의 대관료, 엔지니어 포함 여부, FOH 콘솔, PA와 백라인 조사 정보입니다.` };
}

function Definition({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="detail-row"><dt>{label}</dt><dd>{value || "확인 필요"}</dd></div>;
}

function Availability({ value }: { value: boolean | null }) {
  if (value === true) return <span className="inline-flex items-center gap-1 font-bold text-emerald-700"><Check className="h-4 w-4" />포함</span>;
  if (value === false) return <span className="font-semibold text-slate-500">미포함</span>;
  return <span className="font-semibold text-amber-700">확인 필요</span>;
}

export default async function VenueDetail({ params }: Props) {
  const { slug } = await params;
  const venue = venueBySlug(slug);
  if (!venue) notFound();
  const representative = venue.prices.weekdayMin ?? venue.prices.weekendMin;
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-700"><ArrowLeft className="h-4 w-4" />탐색으로</Link><Link href="/" className="flex items-center gap-2 font-black"><span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-700 text-white"><AudioLines className="h-4 w-4" /></span>STAGE INDEX</Link></div></header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]">
          <div className="overflow-hidden rounded-[24px] shadow-sm"><VenueCover name={venue.name} accent={venue.accent} /></div>
          <div className="flex flex-col justify-center rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap gap-2"><span className="badge badge-positive">{venue.status}</span><span className="badge badge-warning">최신 확인 필요</span></div>
            <p className="text-sm font-bold text-violet-700">{venue.type}</p><h1 className="mt-1 text-3xl font-black tracking-[-0.045em] sm:text-4xl">{venue.name}</h1>
            <div className="mt-5 space-y-2 text-sm text-slate-600"><p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{venue.address}</p><p className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" />{venue.contact}</p><p className="flex gap-2"><Users className="mt-0.5 h-4 w-4 shrink-0" />수용 인원 확인 필요</p></div>
            <div className="mt-7 border-t border-slate-100 pt-5"><p className="text-xs text-slate-500">대표 대관료</p><p className="mt-1 text-2xl font-black">{formatWon(representative)}<span className="ml-1 text-sm font-semibold text-slate-400">부터</span></p></div>
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="detail-section"><div className="detail-heading"><CalendarClock /><div><p>RENTAL</p><h2>대관 조건</h2></div></div><dl><Definition label="평일 대관료" value={venue.prices.weekday} /><Definition label="주말 대관료" value={venue.prices.weekend} /><Definition label="기본 대관시간" value={venue.prices.rentalHours} /><Definition label="부가세" value={venue.prices.taxIncluded === false ? "별도" : venue.prices.taxIncluded === true ? "포함" : "확인 필요"} /><Definition label="추가 조건" value={venue.prices.notes} /></dl></section>
            <section className="detail-section"><div className="detail-heading"><Users /><div><p>CREW</p><h2>인력</h2></div></div><dl><Definition label="음향 엔지니어" value={<Availability value={venue.staff.soundEngineer} />} /><Definition label="조명 오퍼레이터" value={<Availability value={venue.staff.lightingOperator} />} /><Definition label="기본 포함" value={venue.staff.includedNotes} /><Definition label="추가 비용" value={venue.staff.extraFee} /><Definition label="운영 메모" value={venue.staff.notes} /></dl></section>
            <section className="detail-section"><div className="detail-heading"><AudioLines /><div><p>AUDIO</p><h2>음향 시스템</h2></div></div><dl><Definition label="FOH Console" value={venue.audio.console} /><Definition label="Main PA" value={venue.audio.mainPa} /><Definition label="Monitor" value={venue.audio.monitor} /><Definition label="유선 마이크" value={venue.audio.wiredMic} /><Definition label="무선 마이크" value={venue.audio.wirelessMic} /><Definition label="DI Box" value={venue.audio.diBox} /></dl></section>
            <section className="detail-section"><div className="detail-heading"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-sm font-black text-violet-700">BL</span><div><p>BACKLINE</p><h2>백라인</h2></div></div><dl><Definition label="Drum" value={venue.backline.drums} /><Definition label="Guitar Amp" value={venue.backline.guitarAmp} /><Definition label="Bass Amp" value={venue.backline.bassAmp} /><Definition label="Keyboard" value={venue.backline.keyboard} /><Definition label="메모" value={venue.backline.notes} /></dl></section>
          </div>
          <aside className="space-y-5"><CostCalculator venue={venue} /><section className="rounded-[22px] border border-amber-200 bg-amber-50 p-5"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h2 className="font-black text-amber-950">검증 전 정보</h2><p className="mt-1 text-sm leading-6 text-amber-900/80">조사표에 최근 확인일이 없습니다. 대관 전 공식 채널에서 가격과 장비 구성을 확인하세요.</p></div></div></section><section className="rounded-[22px] border border-slate-200 bg-white p-5"><h2 className="font-black">출처</h2><div className="mt-4 space-y-2"><a href={venue.officialUrl} target="_blank" rel="noreferrer" className="source-link">공식 채널<ExternalLink className="h-4 w-4" /></a><a href={venue.sourceUrl} target="_blank" rel="noreferrer" className="source-link">뮬 조사 출처<ExternalLink className="h-4 w-4" /></a></div></section></aside>
        </div>
      </main>
    </div>
  );
}
