"""Convert the research workbook into normalized JSON for Supabase import.

Usage:
  python scripts/import_venues.py source.xlsx data/import

The source workbook is never modified. Ambiguous price and equipment strings are
kept as raw_text and written to import_warnings.json instead of being guessed.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any

from openpyxl import load_workbook


SHEET_FIELDS = {
    "공연장목록": ["venue_name", "venue_type", "district", "address", "nearest_station", "contact", "official_url", "mule_ad_url", "active_status", "last_checked_date", "general_notes"],
    "대관가격": ["venue_name", "weekday_price_krw", "weekend_price_krw", "rental_hours", "tax_included", "engineer_included", "staff_fee_krw", "ticket_settlement", "price_notes"],
    "인력": ["venue_name", "sound_engineer", "lighting_operator", "stage_staff", "included_notes", "crew_fee_krw", "crew_notes"],
    "음향": ["venue_name", "console", "main_pa", "monitor", "stagebox", "channels_spec", "audio_included", "audio_extra_fee_krw", "audio_notes"],
    "마이크DI": ["venue_name", "wired_mic", "wireless_mic", "di_box", "mic_notes"],
    "백라인": ["venue_name", "drums", "guitar_amp", "bass_amp", "keyboard", "stands_chairs", "backline_notes"],
    "조명": ["venue_name", "fixtures", "moving_lights", "follow_spot", "lighting_console", "lighting_notes"],
    "공간편의": ["venue_name", "capacity_people", "stage_size", "waiting_room", "parking", "restroom", "hvac", "accessibility", "wifi", "space_notes"],
    "출처검증": ["venue_name", "mule_source_url", "mule_posted_date", "official_source_url", "checked_date", "checked_by", "source_reliability", "verification_status", "raw_ad_copy", "follow_up_needed", "source_notes"],
}


def clean(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, str):
        value = unicodedata.normalize("NFC", value).strip()
        return None if value in {"", "미기재"} else value
    return value


def ternary(value: Any) -> bool | None:
    value = clean(value)
    if value in {"O", "포함", "가능", "유"}:
        return True
    if value in {"X", "미포함", "불가", "무"}:
        return False
    return None


def slugify(name: str) -> str:
    known = {
        "홍대 플렉스라운지": "hongdae-flex-lounge", "수상한 거리 2호점": "susanghan-street-2",
        "클럽 스틸페이스": "club-steelface", "플렉스 3호점": "flex-no-3", "SPACE HONG": "space-hong",
        "Roller Coaster": "roller-coaster", "001라이브홀": "001-live-hall", "The Mascagni": "the-mascagni",
    }
    return known.get(name, re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "needs-slug")


def sheet_rows(workbook, name: str) -> list[dict[str, Any]]:
    ws = workbook[name]
    fields = SHEET_FIELDS[name]
    rows = []
    for row in ws.iter_rows(min_row=5, max_col=len(fields), values_only=True):
        values = [clean(value) for value in row]
        if not values[0]:
            continue
        rows.append(dict(zip(fields, values)))
    return rows


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: import_venues.py source.xlsx output_directory")
    source = Path(sys.argv[1]).resolve()
    output = Path(sys.argv[2]).resolve()
    output.mkdir(parents=True, exist_ok=True)
    workbook = load_workbook(source, data_only=True, read_only=True)
    tables = {name: sheet_rows(workbook, name) for name in SHEET_FIELDS}
    keyed = {name: {row["venue_name"]: row for row in rows} for name, rows in tables.items()}
    venues = []
    staff = []
    audio = []
    facilities = []
    sources = []
    warnings = []
    for base in tables["공연장목록"]:
        name = base["venue_name"]
        slug = slugify(name)
        price = keyed["대관가격"].get(name, {})
        crew = keyed["인력"].get(name, {})
        sound = keyed["음향"].get(name, {})
        mics = keyed["마이크DI"].get(name, {})
        space = keyed["공간편의"].get(name, {})
        verification = keyed["출처검증"].get(name, {})
        venues.append({"slug": slug, "name": name, "venue_type": base.get("venue_type"), "district": base.get("district"), "address_display": base.get("address"), "address_normalized": None, "nearest_station": base.get("nearest_station"), "official_url": base.get("official_url"), "active_status": base.get("active_status"), "capacity_people": space.get("capacity_people"), "latitude": None, "longitude": None, "last_checked_at": verification.get("checked_date") or base.get("last_checked_date"), "verification_status": verification.get("verification_status") or "unverified"})
        staff.append({"venue_slug": slug, "sound_engineer_included": ternary(crew.get("sound_engineer")), "lighting_operator_included": ternary(crew.get("lighting_operator")), "stage_staff_included": ternary(crew.get("stage_staff")), "included_notes": crew.get("included_notes"), "raw_extra_fee": crew.get("crew_fee_krw"), "notes": crew.get("crew_notes")})
        audio.append({"venue_slug": slug, "foh_console": sound.get("console"), "main_pa": sound.get("main_pa"), "monitor_system": sound.get("monitor"), "wired_mics": mics.get("wired_mic"), "wireless_mics": mics.get("wireless_mic"), "di_boxes": mics.get("di_box")})
        facilities.append({"venue_slug": slug, "waiting_room": ternary(space.get("waiting_room")), "parking": ternary(space.get("parking")), "accessible": ternary(space.get("accessibility")), "restroom": ternary(space.get("restroom")), "hvac": ternary(space.get("hvac")), "wifi": ternary(space.get("wifi")), "notes": space.get("space_notes")})
        for kind, url in (("official", base.get("official_url")), ("mule", base.get("mule_ad_url"))):
            if url:
                sources.append({"venue_slug": slug, "kind": kind, "url": url})
        for field in ("weekday_price_krw", "weekend_price_krw"):
            if price.get(field):
                warnings.append({"venue": name, "field": field, "value": price[field], "reason": "요일·월·대상별 조건을 검토한 뒤 rental_rates 행으로 분리해야 함"})
    payloads = {"venues": venues, "venue_staff": staff, "audio_systems": audio, "venue_facilities": facilities, "sources": sources, "import_warnings": warnings}
    for filename, payload in payloads.items():
        (output / f"{filename}.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    print(json.dumps({"venues": len(venues), "warnings": len(warnings), "output": str(output)}, ensure_ascii=False))


if __name__ == "__main__":
    main()

