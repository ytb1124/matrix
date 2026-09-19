# Supabase 설정

## 1. 프로젝트 값 확인

Supabase Dashboard → **Project Settings → API**에서 Project URL과 Publishable key를 확인합니다. 브라우저에는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`만 사용합니다. Secret key와 과거 Service Role key는 브라우저나 Vercel의 `NEXT_PUBLIC_` 변수에 넣지 않습니다.

## 2. DB 구조 만들기

1. Dashboard → **SQL Editor → New query**로 이동합니다.
2. 먼저 `supabase/schema.sql` 전체를 붙여 넣고 **Run**을 누릅니다.
3. Authentication 사용자 생성 후 `supabase/finalize_setup.sql`을 실행합니다.

`schema.sql`은 enum, 테이블, 인덱스, RLS 정책, `venue-images` bucket을 재실행해도 충돌하지 않도록 구성되어 있습니다. 일부 객체만 만들어진 상태이거나 이전 실행이 중간에 실패한 경우에도 **파일 전체를 다시 실행**하는 것이 권장됩니다. 기존 테이블과 데이터는 삭제하지 않으며, 정책만 현재 정의로 안전하게 교체합니다.

단, 현재 DB에 같은 이름의 컬럼이 다른 자료형으로 수동 생성되어 있다면 자동으로 강제 변환하지 않습니다. 이 경우 테이블을 삭제하지 말고 오류 메시지와 해당 컬럼 정의를 먼저 확인합니다.

## 3. 관리자 계정 등록

Dashboard → **Authentication → Users**에서 관리자 이메일 사용자를 생성합니다. UID가 요청에 제공된 네 UUID와 일치하는지 확인한 다음 `finalize_setup.sql`을 실행합니다. `admin_users`에 없는 로그인 사용자는 관리자 화면 데이터를 읽거나 수정할 수 없습니다.

## 4. Storage 확인

`schema.sql`은 **Storage → Buckets**에 `venue-images` public bucket을 만들고 읽기 공개, 쓰기 관리자 전용 정책을 생성합니다. Bucket이 보이지 않으면 SQL 실행 오류를 먼저 확인합니다. 관리자 로그인 후 업로드하고, 로그아웃 상태에서는 업로드·삭제가 거부되는지 확인합니다.

## 5. RLS 확인

Dashboard → **Database → Tables**에서 각 테이블의 RLS가 Enabled인지 확인합니다. SQL Editor에서 `finalize_setup.sql` 마지막 두 조회문을 실행하면 RLS와 bucket 상태를 점검할 수 있습니다. anon/publishable key로 쓰기가 성공하면 정책이 잘못된 것이므로 배포 전에 중지하고 정책을 재검토합니다.

## 6. 데이터 넣기

Excel 변환은 `python scripts/import_venues.py 원본.xlsx data/import`로 수행합니다. 결과를 검토한 뒤 UUID 관계를 연결해 Supabase에 넣습니다. 가격·수용 인원·Boolean을 표시 문자열이 아닌 `integer`/`boolean` 컬럼에 넣어야 필터가 정확히 동작합니다.

관리자 저장은 Supabase에 즉시 반영되며 사이트 재배포가 필요 없습니다.
