# MATRIX

홍대·합정·상수·망원권 공연장의 대관 조건과 기술 사양을 검색하고 비교하는 서비스입니다. 원본 조사표와 연결된 Supabase 데이터를 사용하며, 없는 값이나 좌표를 추측하지 않습니다.

## 주요 기능

- 공연장명, 생활권, 요일별 가격, 수용 인원, 엔지니어, 장비, 주차 필터와 정렬
- URL Search Params 기반 필터 공유·새로고침 유지
- 목록 / Naver 지도 전환, 데스크톱 split view, 모바일 전체 지도
- 공연장 상세 URL, 2~4곳 비교, 확인 가능한 최소 대관료 계산
- Supabase Auth 관리자 로그인, 공연장 CRUD, Technical 정보와 장비 편집
- Supabase Storage 다중 이미지 업로드·교체·삭제
- 주소 변경 감지 기반 Naver Maps Geocoding 변환

## 데이터 원칙

Excel에는 8개 공연장이 있으며 가격은 요일·월·대상 조건이 한 셀에 섞여 있고 장비는 다중값입니다. 수용 인원, 좌표, 확인일이 없는 행은 임의로 보완하지 않습니다. 복합 가격은 `rental_rates.raw_text`를 보존하면서 검토가 끝난 대표 숫자만 `price_krw`에 저장합니다.

사용자 지역 필터는 생활권 기준 `area_label` 하나만 노출합니다. 현재 값은 `홍대`, `합정`, `상수`, `망원`, `기타`입니다. 행정동은 `neighborhood`에 별도로 저장합니다.

## Supabase 설정

1. Supabase 프로젝트의 SQL Editor에서 [supabase/schema.sql](supabase/schema.sql)을 실행합니다.
2. Authentication에서 관리자 계정을 생성합니다.
3. 생성된 사용자의 UUID를 [supabase/finalize_setup.sql](supabase/finalize_setup.sql)로 `admin_users`에 추가합니다.

```sql
insert into public.admin_users (user_id)
values ('관리자-auth-users-uuid');
```

4. `schema.sql`이 생성한 `venue-images` public bucket과 Storage 정책을 확인합니다.
5. Excel 변환 결과를 검토한 뒤 `scripts/seed-supabase.ts`로 `venues`, `rental_rates` 및 관련 표에 적재합니다.

RLS 정책상 일반 사용자는 공개 데이터를 읽을 수만 있고, `admin_users`에 등록된 로그인 사용자만 공연장·가격·장비·이미지를 수정할 수 있습니다. `/admin`에서 로그인 후 저장한 내용은 다음 페이지 요청부터 즉시 반영되며 재배포가 필요 없습니다.

## Naver Maps 설정

Naver Cloud Platform에서 Maps 서비스의 Dynamic Map과 Geocoding을 활성화합니다.

1. Dynamic Map용 Client ID에 실제 배포 도메인과 로컬 개발 주소를 Web Service URL로 등록합니다.
2. 서버에서 사용할 Geocoding Client ID / Secret을 발급합니다.
3. 주소를 정규화한 뒤 아래 스크립트를 한 번 실행합니다.

```bash
NAVER_MAPS_GEOCODING_CLIENT_ID=... \
NAVER_MAPS_GEOCODING_CLIENT_SECRET=... \
npx tsx scripts/geocode-venues.ts data/import/venues.json data/import/venues.geocoded.json
```

스크립트는 주소 SHA-256 hash가 바뀐 행만 다시 요청합니다. 결과의 `geocoded_address`가 원본 주소와 일치하는지 사람이 검토한 후에만 `location_verified=true`로 저장합니다. 지도는 `location_verified=true`이면서 위도·경도가 모두 존재하는 공연장만 표시합니다.

## 환경 변수

로컬은 `.env.local`, 배포 환경은 Sites 또는 Vercel 환경 변수에 설정합니다. Secret key를 저장소에 커밋하지 않습니다.

```text
# 브라우저 공개 가능. RLS가 쓰기 권한을 보호함
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Naver Maps JavaScript 지도. 공개 Client ID지만 허용 도메인을 제한해야 함
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=

# 로컬 geocoding 스크립트 전용. 브라우저에 노출 금지
NAVER_MAPS_GEOCODING_CLIENT_ID=
NAVER_MAPS_GEOCODING_CLIENT_SECRET=
```

`SUPABASE_SECRET_KEY`는 초기 import와 geocoding 같은 로컬 관리 작업에서만 선택적으로 사용하며 사이트 런타임과 브라우저에는 제공하지 않습니다.

초보자용 전체 절차는 [SUPABASE_SETUP.md](SUPABASE_SETUP.md), [NAVER_MAP_SETUP.md](NAVER_MAP_SETUP.md), [DEPLOYMENT.md](DEPLOYMENT.md)를 따릅니다.

## Excel 이관

```bash
python scripts/import_venues.py /path/to/hongdae_venue_research_0919.xlsx data/import
```

원본은 수정하지 않습니다. 자동 분리하기 위험한 가격은 `import_warnings.json`에 남깁니다.

## 로컬 실행

```bash
npm ci
npm run dev
```

## 구조

```text
app/                       목록, 상세, 관리자 App Router 화면
components/                탐색, Naver 지도, 관리자, 비용 계산 UI
lib/venue-data.ts          Supabase 읽기와 Excel fallback
lib/venues.ts              환경 설정 전 fallback 데이터
scripts/import_venues.py   Excel → 정규화 JSON
scripts/seed-supabase.ts   검토된 조사 데이터 → Supabase 안전 적재
scripts/geocode-supabase.ts Naver 주소 geocoding → Supabase 저장
supabase/schema.sql        PostgreSQL, RLS, Storage 정책
DESIGN_SYSTEM.md           MATRIX UI 기준
```
