# MATRIX 배포

MATRIX의 기본 운영 배포 대상은 Cloudflare Workers입니다. Next.js App Router 코드는 vinext로 빌드하며 Supabase DB, Auth, Storage는 그대로 유지합니다.

처음 배포하는 경우 [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md)를 순서대로 진행합니다.

## 배포 전 확인

1. `npm ci`
2. `npm run check:vinext`
3. `npm run lint`
4. `npx tsc --noEmit`
5. `npm run build:cloudflare`
6. `npm run deploy:cloudflare:dry-run`

## 핵심 원칙

- 공개 설정 세 개만 Cloudflare Build Variables와 Runtime Variables에 등록합니다.
- Supabase Secret Key와 Naver Geocoding Secret은 로컬 `.env.local`에만 둡니다.
- Cloudflare Worker 이름은 `matrix-venue`로 통일합니다.
- 커스텀 도메인 연결 후 Naver Maps 허용 URL과 Supabase Auth URL을 갱신합니다.
- DB 수정은 Supabase에 즉시 반영되며 Worker 재배포가 필요 없습니다.
