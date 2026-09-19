# MATRIX Cloudflare Workers 배포

MATRIX는 Next.js App Router 구조를 유지하면서 vinext로 빌드해 Cloudflare Workers에서 실행합니다. Supabase DB, Auth, Storage는 그대로 사용하며 Cloudflare로 데이터를 옮기지 않습니다.

## 1. 준비 사항

1. [Cloudflare Dashboard](https://dash.cloudflare.com/sign-up)에서 계정을 만듭니다.
2. 커스텀 도메인을 Cloudflare에 추가하고 안내받은 네임서버로 변경합니다.
3. 프로젝트를 GitHub repository에 올립니다. `.env.local`, `.dev.vars`, Secret Key가 GitHub에 없는지 반드시 확인합니다.
4. Cloudflare에서 사용할 Worker 이름은 `matrix-venue`입니다. `wrangler.jsonc`의 `name`과 Cloudflare 프로젝트 이름이 같아야 합니다.

## 2. 로컬 확인

Node.js 22 이상이 필요합니다.

```bash
npm ci
cp .dev.vars.example .dev.vars
npm run check:vinext
npm run dev
```

`.dev.vars`에 아래 세 값을 입력합니다. 이 파일은 Git에서 제외됩니다.

```text
NEXT_PUBLIC_SUPABASE_URL=https://프로젝트.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=...
```

프로덕션 Worker와 동일한 방식으로 확인하려면 다음을 실행합니다.

```bash
npm run build:cloudflare
npm run preview:cloudflare
```

## 3. GitHub repository 연결

1. Cloudflare Dashboard → **Workers & Pages**로 이동합니다.
2. **Create application → Import a repository**를 선택합니다.
3. GitHub 연결을 승인하고 MATRIX repository를 선택합니다.
4. Production branch는 `main`, Root directory는 repository 루트로 설정합니다.
5. Worker 이름을 `matrix-venue`로 설정합니다.
6. Build command는 `npm ci && npm run build:cloudflare`로 설정합니다.
7. Deploy command는 `npm run deploy:cloudflare:built`로 설정합니다.
8. 저장하면 Cloudflare가 첫 빌드를 실행합니다.

다른 브랜치의 커밋은 preview version으로 업로드할 수 있습니다. Production branch를 바꾸려면 **Settings → Build**에서 변경합니다.

## 4. 환경변수 등록

Cloudflare의 build-time 변수와 Worker runtime 변수는 서로 다릅니다. 다음 공개 변수 세 개는 빌드와 런타임 양쪽에 동일하게 등록하는 것이 가장 안전합니다.

| 변수 | 공개 여부 | Build Variables | Runtime Variables |
|---|---|---:|---:|
| `NEXT_PUBLIC_SUPABASE_URL` | 공개 | 등록 | 등록 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 공개 | 등록 | 등록 |
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | 공개 | 등록 | 등록 |

### Build Variables

Worker → **Settings → Build → Build Variables and Secrets**에서 세 값을 등록합니다. `NEXT_PUBLIC_*` 값은 브라우저 번들에 포함될 수 있으므로 비밀값으로 취급하지 않습니다.

### Runtime Variables

Worker → **Settings → Variables & Secrets**에서도 같은 세 값을 추가합니다. Supabase의 RLS가 쓰기 권한을 보호하므로 Publishable Key는 공개되어도 됩니다.

### Cloudflare에 등록하지 않는 값

다음 값은 로컬 데이터 관리·geocoding 스크립트에서만 사용합니다.

- `SUPABASE_SECRET_KEY`
- `NAVER_MAPS_GEOCODING_CLIENT_ID`
- `NAVER_MAPS_GEOCODING_CLIENT_SECRET`

이 값들은 Worker, GitHub, `wrangler.jsonc`, `NEXT_PUBLIC_*` 변수에 넣지 않습니다. 로컬 `.env.local`에만 보관합니다.

## 5. 첫 배포 확인

Cloudflare build 로그에서 다음 두 단계가 성공해야 합니다.

1. `vinext build`가 `dist/client`과 `dist/server`를 생성
2. Wrangler가 생성된 `dist/server/wrangler.json`으로 Worker 배포

배포가 끝나면 Cloudflare가 제공한 `https://matrix-venue.<계정>.workers.dev` 주소를 엽니다.

로컬에서 직접 배포하려면 다음 방법도 사용할 수 있습니다.

```bash
npx wrangler login
npm run deploy:cloudflare
```

로그인 후 계정 선택이 모호하면 `CLOUDFLARE_ACCOUNT_ID`를 로컬 환경변수로 설정합니다. API Token은 Git이나 프로젝트 파일에 저장하지 않습니다.

## 6. 커스텀 도메인 연결

1. Cloudflare Dashboard → **Workers & Pages → matrix-venue**로 이동합니다.
2. **Settings → Domains & Routes → Add → Custom Domain**을 선택합니다.
3. 사용할 도메인 또는 서브도메인을 입력합니다. 예: `matrix.example.com`.
4. Cloudflare가 Worker용 DNS record와 SSL 인증서를 자동 생성하는 것을 확인합니다.

해당 hostname에 기존 A, AAAA, CNAME record가 있으면 Custom Domain을 추가하기 전에 충돌하는 record를 정리해야 합니다. Cloudflare가 DNS record를 자동 생성했다면 동일한 record를 수동으로 다시 만들지 않습니다.

## 7. 외부 서비스 도메인 갱신

커스텀 도메인이 열리면 다음 두 곳을 갱신합니다.

1. Naver Cloud Platform의 Web Dynamic Map 허용 Web Service URL에 `https://커스텀도메인`을 추가합니다.
2. Supabase Dashboard → **Authentication → URL Configuration**에서 Site URL을 커스텀 도메인으로 설정하고 필요한 redirect URL을 추가합니다.

기존 `workers.dev` 주소를 preview나 비상 접속용으로 사용할 예정이면 함께 허용해 둡니다.

## 8. 배포 후 테스트

- 메인 목록에 공연장 8개가 표시되는지 확인
- 필터와 목록/지도 전환 확인
- 검증된 Marker와 실제 주소 대조
- 공연장 상세페이지 확인
- `/admin` 로그인과 관리자 권한 확인
- 공연장 수정 후 재배포 없이 즉시 반영되는지 확인
- 이미지 업로드·삭제 확인
- 로그아웃 상태에서 쓰기 작업이 거부되는지 확인
- 모바일 화면과 브라우저 콘솔 오류 확인
- `workers.dev`와 커스텀 도메인에서 모두 정적 파일이 정상 로딩되는지 확인

## 9. Rollback

### Cloudflare Dashboard

1. **Workers & Pages → matrix-venue → Deployments**로 이동합니다.
2. 정상 동작했던 이전 version을 선택합니다.
3. **Rollback**을 실행해 해당 version에 100% 트래픽을 돌립니다.

### Wrangler

```bash
npx wrangler rollback
```

코드 rollback은 Supabase 데이터를 되돌리지 않습니다. 관리자 화면에서 변경한 DB 데이터까지 복구해야 한다면 Supabase 백업 또는 별도 SQL 복구가 필요합니다.

GitHub의 잘못된 commit도 `git revert`로 되돌린 뒤 `main`에 push하면 새 정상 배포를 만들 수 있습니다.

## 10. 자주 발생하는 문제

- **환경변수 누락:** Build Variables와 Runtime Variables 양쪽을 확인합니다.
- **지도 미표시:** Naver Maps 허용 URL에 현재 origin이 등록됐는지 확인합니다.
- **관리자 로그인 실패:** Supabase Site URL, redirect URL, 관리자 UID를 확인합니다.
- **Worker 이름 오류:** Cloudflare 프로젝트 이름과 `wrangler.jsonc`의 `matrix-venue`가 같은지 확인합니다.
- **Custom Domain 추가 실패:** 같은 hostname의 기존 CNAME/A record 충돌을 확인합니다.
- **Build 성공 후 흰 화면:** `dist/server/wrangler.json`을 사용해 배포했는지 확인합니다.

공식 참고 문서:

- [vinext Cloudflare 배포](https://github.com/cloudflare/vinext#cloudflare-workers)
- [Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)
- [Workers 환경변수와 Secret](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Workers Rollback](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)
