# GitHub · Supabase · Vercel 배포

## 1. GitHub

1. GitHub에서 빈 repository를 만듭니다.
2. 프로젝트 폴더에서 `git status`로 변경사항을 확인합니다.
3. `.gitignore`에 `.env`, `.env.local`, `.env.*.local`이 포함됐는지 확인합니다.
4. `git add .`, `git commit -m "Deploy MATRIX"`, `git remote add origin 저장소주소`, `git push -u origin main` 순서로 업로드합니다.
5. GitHub 파일 목록에 `.env.local`과 Secret 값이 없는지 다시 확인합니다.

## 2. Supabase

Supabase에 웹 코드를 업로드하는 구조가 아닙니다. 웹 코드는 GitHub/Vercel에 배포하고, Supabase는 DB·Auth·Storage를 제공합니다.

1. `supabase/schema.sql` 실행
2. Authentication 관리자 사용자 생성
3. `supabase/finalize_setup.sql` 실행
4. `venue-images` bucket과 RLS 확인
5. 검토한 Excel 데이터 import
6. 주소 geocoding 실행 및 위치 검증
7. Project URL과 Publishable key 확인

세부 절차는 `SUPABASE_SETUP.md`를 따릅니다.

## 3. Vercel

1. Vercel → **Add New → Project**에서 GitHub repository를 Import합니다.
2. Framework는 자동 감지를 우선 사용하고 Build Command는 `npm run build`로 설정합니다.
3. **Project Settings → Environment Variables**에서 다음을 등록합니다.

| 변수 | 공개 여부 | Production | Preview | Development |
|---|---|---:|---:|---:|
| `NEXT_PUBLIC_SUPABASE_URL` | 브라우저 공개 | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 브라우저 공개 | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | 브라우저 공개 | ✓ | ✓ | ✓ |
| `NAVER_MAPS_GEOCODING_CLIENT_ID` | 서버 전용 | 필요 시 | 필요 시 | ✓ |
| `NAVER_MAPS_GEOCODING_CLIENT_SECRET` | Secret | 필요 시 | 필요 시 | ✓ |
| `SUPABASE_SECRET_KEY` | 로컬 관리 스크립트 전용 | 설정하지 않음 | 설정하지 않음 | 로컬만 |

Geocoding은 페이지 요청에서 실행하지 않으므로 Vercel에는 보통 Naver Secret과 Supabase Secret을 넣을 필요가 없습니다. 로컬 관리 환경에서만 사용하는 편이 안전합니다.

## 4. 배포 후 체크리스트

- Vercel Production URL 접속
- Naver Maps Web Service URL에 Vercel origin 추가
- Supabase Authentication → URL Configuration에 Site URL과 필요한 `/admin` redirect origin 등록
- 관리자 로그인/권한 거부 테스트
- 공연장 추가·수정·삭제 후 사용자 화면 즉시 반영 확인
- 이미지 다중 업로드·삭제 확인
- 실제 주소와 Marker 위치 대조 후 `location_verified` 승인
- 목록/지도 필터 결과 수 일치 확인
- 모바일 화면과 브라우저 콘솔 확인
