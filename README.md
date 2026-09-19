# STAGE INDEX

홍대·합정·상수권 공연장의 대관 조건과 기술 사양을 검색하고 비교하는 1차 MVP입니다. 원본 조사표에 없는 값은 추측하지 않고 `확인 필요`로 노출합니다.

## 구현 범위

- 공연장 8곳 목록, 검색, 지역·가격·엔지니어·드럼·콘솔 필터
- 기본순, 가격순, 수용 인원순, 최근 업데이트순 정렬
- 목록/지도 전환. 좌표가 없는 현재 데이터에는 임의 마커 대신 좌표 등록 상태 표시
- 공연장 고유 상세 URL과 SEO metadata
- 공연장 2~4곳 비교표
- 확인 가능한 최소 대관료 기반 비용 계산과 VAT 선택
- 모바일 필터 패널, 반응형 카드/상세/비교 UI
- 정규화된 Supabase PostgreSQL 스키마
- Excel 변환 스크립트와 Kakao 주소 geocoding 스크립트

## Excel 분석 요약

원본에는 `시작하기`, `공연장목록`, `대관가격`, `인력`, `음향`, `마이크DI`, `백라인`, `조명`, `공간편의`, `출처검증`, `최종정리` 시트가 있습니다. 실제 공연장은 8곳입니다. `공연장목록`의 행 번호가 나머지 시트와 연결되는 구조이며, `최종정리`는 수식으로 이를 다시 모읍니다.

현재 데이터의 주요 제약:

- 가격이 요일, 월, 대상, 시간 조건을 한 셀에 묶은 문자열입니다.
- 장비는 줄바꿈이나 쉼표로 묶인 다중값입니다.
- `공간편의`, `조명`, `출처검증`은 데이터 행이 거의 비어 있습니다.
- 수용 인원, 위도·경도, 최근 확인일이 8곳 모두 비어 있습니다.
- `O`, `X`, `미기재`, 빈칸이 섞여 있어 Boolean과 unknown을 구분해야 합니다.
- 원본의 100개 준비 행은 비어 있어 실제 데이터 행으로 취급하면 안 됩니다.

## 권장 데이터 구조

`supabase/schema.sql`은 다음 관계를 정의합니다.

- `venues`: 공연장 기본 정보, 주소, 지도 좌표, 수용 인원, 최신성
- `rental_rates`: 요일·월·대상별 숫자 가격 규칙과 원문
- `venue_staff`: 인력 포함 여부와 추가 비용 원문
- `audio_systems`: FOH, PA, Monitor, Mic, DI
- `equipment_catalog`, `venue_equipment`: 정규화 장비와 공연장별 보유 내역
- `venue_facilities`: 편의·접근 정보
- `sources`, `verification_records`: 출처와 확인 이력

가격과 장비 문자열은 자동 추측해 쪼개지 않습니다. 변환 스크립트는 애매한 셀을 `import_warnings.json`에 남기고 사람이 검토하도록 합니다.

## 프로젝트 구조

```text
app/                    Next.js App Router 화면과 metadata
components/             탐색, 카드, 비교, 비용 계산 UI
lib/venues.ts           현재 MVP에서 쓰는 정제된 8개 공연장 데이터
scripts/import_venues.py Excel → 정규화 JSON 변환
scripts/geocode-venues.ts Kakao 주소 geocoding 후보 생성
supabase/schema.sql     PostgreSQL schema
public/                 favicon 등 정적 자산
```

## 로컬 실행

Node.js 22.13 이상에서:

```bash
npm ci
npm run dev
```

## 데이터 이관

원본 Excel을 보존한 상태로 Python 3와 `openpyxl`을 사용합니다.

```bash
python scripts/import_venues.py /path/to/hongdae_venue_research_0919.xlsx data/import
```

출력 JSON을 검토하고 `import_warnings.json`의 가격 규칙을 `rental_rates` 행으로 확정한 뒤 Supabase에 적재합니다. 좌표는 Kakao Local API 결과를 만든 다음 주소 일치 여부를 사람이 확인해야 합니다.

```bash
KAKAO_REST_API_KEY=... npx tsx scripts/geocode-venues.ts data/import/venues.json data/import/venues.geocoded.json
```

## 환경 변수

Supabase 연동 시 다음 값을 배포 환경에 설정합니다. 저장소에 실제 키를 커밋하지 않습니다.

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
KAKAO_REST_API_KEY=
NEXT_PUBLIC_KAKAO_MAP_KEY=
```

서비스 역할 키는 서버 측 import/admin 작업에서만 사용합니다.

