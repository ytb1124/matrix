import { ImageOff } from "lucide-react";

export function VenueCover({ name, compact = false }: { name: string; accent: string; compact?: boolean }) {
  return (
    <div className={`venue-cover ${compact ? "venue-cover-compact" : ""}`}>
      <ImageOff aria-hidden="true" />
      <span>사진 준비 중</span>
      {!compact && <strong>{name}</strong>}
    </div>
  );
}
