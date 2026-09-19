# Naver Maps 설정

## 1. Application 생성

1. Naver Cloud Platform Console에 로그인합니다.
2. **Services → AI·NAVER API → Maps → Application**에서 새 Application을 생성합니다.
3. **Web Dynamic Map**과 **Geocoding**을 선택합니다.

## 2. Web Service URL 등록

Dynamic Map 허용 URL에 다음을 각각 등록합니다.

- 로컬: `http://localhost:5173`
- Sites: `https://hongdae-venue-tech-db.luxconsulting.chatgpt.site`
- Vercel 배포 후: Vercel이 발급한 `https://...vercel.app`
- 실제 커스텀 도메인을 사용하면 그 origin도 추가

경로가 아니라 `https://도메인` 형태의 origin을 등록합니다.

## 3. 환경변수 구분

- 브라우저 공개 가능: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
- 서버/로컬 스크립트 전용: `NAVER_MAPS_GEOCODING_CLIENT_ID`, `NAVER_MAPS_GEOCODING_CLIENT_SECRET`

Client Secret은 GitHub, 브라우저 코드, `NEXT_PUBLIC_` 변수에 절대 넣지 않습니다.

## 4. 주소 geocoding

Supabase URL과 서버용 Secret key까지 로컬 `.env.local`에 설정한 뒤 실행합니다.

```bash
node --env-file=.env.local --experimental-strip-types scripts/geocode-supabase.ts
```

스크립트는 주소 hash가 달라진 공연장만 다시 요청하고 결과를 Supabase에 저장합니다. 성공 결과도 `location_verified=false`로 저장되므로 관리자 화면에서 원본 주소와 지도 위치를 사람 눈으로 확인한 뒤에만 검증 상태를 켭니다. 실패한 주소는 임의 좌표로 대체하지 않으며 지도에도 표시되지 않습니다.
