# MATRIX Design System

MATRIX는 공연장을 빠르게 찾고 기술 조건을 비교하는 검색 도구다. 화면은 흰색과 중성 회색을 중심으로 구성하고, 선택·강조에만 오렌지색을 사용한다. 장식보다 정보 우선순위와 조밀한 탐색 흐름을 우선한다.

## Typography

- Font family: `Pretendard Variable`, Pretendard, Apple SD Gothic Neo, system sans-serif
- Size scale: 12 / 13 / 14 / 16 / 18 / 22 / 28 / 36px
- Weight scale: 400 body, 500 metadata, 600 controls, 700 venue names, 800 page headings
- Body: 14–16px, line-height 1.55
- Labels and metadata: 12–13px. 12px 미만은 사용하지 않는다.

## Spacing

- Base unit: 4px
- Scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48px
- 카드 내부 여백: desktop 16px, mobile 14px
- 섹션 간격: 24–32px

## Surfaces and Borders

- Page: `#f6f6f4`
- Primary surface: `#ffffff`
- Text: `#151515`; secondary `#666666`
- Accent: `#ff4f24`; selected background `#fff1ec`
- Border: 1px solid `#dededb`
- Radius: controls 6px, cards 8px, dialogs/sheets 12px
- Shadow: 메뉴·모달·sticky overlay에만 제한적으로 사용

## Layout

- Container width: max 1600px, desktop side padding 28px, mobile 16px
- Header height: 64px desktop, 56px mobile
- Search bar: 46px high, max 680px
- Filter chip: 38px high, 6px radius
- Venue card image: 16:10
- List grid: 2 columns ≥768px, 3 columns ≥1180px, 4 columns ≥1480px
- Map split: list 38%, map 62%; minimum desktop map height 620px
- Detail page: content 1fr + 320px aside at ≥1024px

## Breakpoints

- Mobile: `< 768px`
- Tablet: `768–1179px`
- Desktop: `1180–1479px`
- Wide desktop: `≥1480px`

## Component States

- Hover: border darkens and venue name changes to accent; no lift animation
- Selected: accent border plus pale accent background
- Disabled: 45% opacity, no pointer interaction
- Focus: 2px accent outline with 2px offset
- Loading: preserve layout and show plain skeleton blocks
- Empty/error: concise inline notice; no decorative illustration

## Key Components

- Header: logo, integrated search, admin link. No marketing copy.
- Filter row: sticky below header; region, day basis, price range, technical filters, list/map toggle.
- Venue card: large image/placeholder, venue name, single normalized area, capacity when known, day-based price, engineer, console, up to two equipment labels.
- Map view: desktop split list/map; mobile switches to full map. Markers appear only for verified coordinates.
- Detail sections: grouped by Rental, Crew, Audio, Backline, Lighting, Facilities, Source. Missing fields are omitted.
