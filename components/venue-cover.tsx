import { AudioLines, Mic2 } from "lucide-react";

const palette: Record<string, string> = {
  violet: "from-[#6d28d9] via-[#111827] to-[#09090b]",
  blue: "from-[#0369a1] via-[#0f172a] to-[#020617]",
  red: "from-[#b91c1c] via-[#18181b] to-[#09090b]",
  amber: "from-[#b45309] via-[#1c1917] to-[#09090b]",
  emerald: "from-[#047857] via-[#111827] to-[#030712]",
  cyan: "from-[#0e7490] via-[#0f172a] to-[#020617]",
  pink: "from-[#be185d] via-[#18181b] to-[#09090b]",
  slate: "from-[#475569] via-[#111827] to-[#020617]",
};

export function VenueCover({ name, accent, compact = false }: { name: string; accent: string; compact?: boolean }) {
  return (
    <div className={`venue-cover relative overflow-hidden bg-gradient-to-br ${palette[accent] ?? palette.violet} ${compact ? "h-24" : "h-48"}`}>
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(105deg,transparent_0%,transparent_45%,rgba(255,255,255,.12)_46%,transparent_47%),repeating-linear-gradient(90deg,transparent_0,transparent_32px,rgba(255,255,255,.06)_33px)]" />
      <AudioLines className="absolute -right-5 top-1/2 h-28 w-28 -translate-y-1/2 text-white/15" strokeWidth={1.2} />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/65 to-transparent p-4 text-white">
        <div>
          <span className="mb-2 inline-flex rounded-full border border-white/20 bg-black/20 px-2 py-1 text-[11px] font-medium tracking-wide backdrop-blur">VENUE FILE</span>
          {!compact && <p className="max-w-[17rem] text-lg font-bold leading-tight">{name}</p>}
        </div>
        <Mic2 className="h-5 w-5 text-white/70" />
      </div>
      <span className="absolute left-4 top-4 text-xs font-medium text-white/55">사진 준비 중</span>
    </div>
  );
}

