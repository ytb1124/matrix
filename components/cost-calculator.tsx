"use client";

import { useMemo, useState } from "react";
import { formatWon, type Venue } from "@/lib/venues";

export function CostCalculator({ venue }: { venue: Venue }) {
  const [basis, setBasis] = useState<"weekday" | "weekend">("weekend");
  const [vat, setVat] = useState(false);
  const base = basis === "weekday" ? venue.prices.weekdayMin : venue.prices.weekendMin;
  const total = useMemo(() => base === null ? null : Math.round(base * (vat && venue.prices.taxIncluded === false ? 1.1 : 1)), [base, vat, venue.prices.taxIncluded]);
  return (
    <section className="cost-calculator">
      <h2>예상 비용</h2><p>확인 가능한 최소 대관료만 계산합니다.</p>
      <div className="cost-tabs"><button onClick={() => setBasis("weekday")} className={basis === "weekday" ? "active" : ""}>평일</button><button onClick={() => setBasis("weekend")} className={basis === "weekend" ? "active" : ""}>주말</button></div>
      {base === null ? <div className="cost-unavailable">세부 비용은 공연장 문의 필요</div> : <><div className="cost-line"><span>기본 대관료</span><b>{formatWon(base)}</b></div>{venue.prices.taxIncluded === false && <label className="cost-vat"><span>VAT 10% 포함</span><input type="checkbox" checked={vat} onChange={(event) => setVat(event.target.checked)} /></label>}<div className="cost-total"><span>예상 최소 비용</span><strong>{formatWon(total)}</strong></div></>}
    </section>
  );
}
