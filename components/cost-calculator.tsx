"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { formatWon, type Venue } from "@/lib/venues";

export function CostCalculator({ venue }: { venue: Venue }) {
  const [basis, setBasis] = useState<"weekday" | "weekend">("weekend");
  const [vat, setVat] = useState(false);
  const base = basis === "weekday" ? venue.prices.weekdayMin : venue.prices.weekendMin;
  const total = useMemo(() => base === null ? null : Math.round(base * (vat && venue.prices.taxIncluded === false ? 1.1 : 1)), [base, vat, venue.prices.taxIncluded]);
  return (
    <section className="rounded-[22px] bg-slate-950 p-5 text-white shadow-xl shadow-slate-200">
      <div className="flex items-center gap-2"><Calculator className="h-5 w-5 text-violet-400" /><h2 className="font-black">예상 비용</h2></div>
      <p className="mt-2 text-xs leading-5 text-slate-400">원본에서 명확히 숫자로 확인되는 최소 대관료만 계산합니다.</p>
      <div className="mt-5 grid grid-cols-2 rounded-xl bg-white/10 p-1"><button onClick={() => setBasis("weekday")} className={`rounded-lg py-2 text-sm font-bold ${basis === "weekday" ? "bg-white text-slate-950" : "text-slate-300"}`}>평일</button><button onClick={() => setBasis("weekend")} className={`rounded-lg py-2 text-sm font-bold ${basis === "weekend" ? "bg-white text-slate-950" : "text-slate-300"}`}>주말</button></div>
      {base === null ? <div className="mt-5 rounded-xl bg-white/10 p-4 text-sm text-slate-300">세부 비용은 공연장 문의 필요</div> : <><div className="mt-5 flex items-center justify-between text-sm"><span className="text-slate-400">기본 대관료</span><b>{formatWon(base)}</b></div>{venue.prices.taxIncluded === false && <label className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm"><span className="text-slate-300">VAT 10% 포함해 보기</span><input type="checkbox" checked={vat} onChange={(event) => setVat(event.target.checked)} className="h-5 w-5 accent-violet-500" /></label>}<div className="mt-5 border-t border-white/10 pt-5"><p className="text-xs text-slate-400">예상 최소 비용</p><p className="mt-1 text-2xl font-black">{formatWon(total)}</p></div></>}
    </section>
  );
}
