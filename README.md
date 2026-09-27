# Parfumoir (파퓨무아)

브랜드별 향수와 큐레이터 리뷰, 이용자 인용 리뷰, 내 컬렉션, 위시리스트 AI 추천, 향뿌캘린더, 신향 추가 요청판, 뉴스레터(웹 + 메일 구독)가 있는 향수 큐레이팅 사이트예요.

- 화면: Next.js 15 (App Router)
- 회원·데이터베이스: Supabase
- 호스팅: Vercel
- 뉴스레터 메일: Resend
- AI 추천: Claude API (키가 없으면 노트 매칭 추천으로 자동 대체)

모든 과정은 **아이패드 사파리에서** 할 수 있어요. 프로그램을 설치할 필요는 없어요.

---

## 전체 순서

1. Supabase에서 데이터베이스 만들기
2. Resend에서 메일 발송 키 받기
3. (선택) Claude API 키 받기
4. Vercel로 사이트 배포하기
5. 주소 연결 마무리
6. 나를 관리자로 지정하기

각 단계에서 받은 **키(긴 문자열)** 는 메모장에 모아 두세요. 4단계에서 한꺼번에 넣어요.

---

## 1. Supabase — 데이터베이스와 로그인

1. [supabase.com](https://supabase.com) → **Start your project** → GitHub 계정으로 로그인해요.
2. **New project**를 눌러요.
   - Name: `hyanggirok`
   - Database Password: **Generate a password**를 누르고 메모장에 저장해요.
   - Region: **Northeast Asia (Seoul)**
   - **Create new project**를 누르고 1~2분 기다려요.
3. 왼쪽 메뉴에서 **SQL Editor**를 눌러요.
   - 이 저장소의 `supabase/schema.sql` 파일을 GitHub에서 열고, 오른쪽 위 **복사 아이콘(Copy raw file)** 으로 내용을 복사해요.
   - SQL Editor 빈칸에 붙여넣고 오른쪽 아래 **Run**을 눌러요. "Success"가 나오면 돼요.
   - 새 쿼리 탭(**+**)을 열고 `supabase/seed.sql`도 똑같이 복사 → 붙여넣기 → **Run** 해요. (샘플 향수 17종과 예시 리뷰·뉴스레터가 들어가요)
   - 마지막으로 `supabase/migration-002-banners.sql`도 같은 방법으로 **Run** 해요. (메인 화면 배너·사진 기능)
4. 왼쪽 메뉴 **Project Settings**(톱니바퀴) → **API**에서 아래 세 가지를 메모장에 복사해요.
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** 키(Reveal을 눌러야 보여요) → `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ service_role 키는 모든 데이터를 열 수 있는 열쇠예요. 코드나 채팅에 붙여넣지 말고 Vercel 설정에만 넣으세요.

## 2. Resend — 뉴스레터 메일

1. [resend.com](https://resend.com)에서 가입해요.
2. 왼쪽 **API Keys** → **Create API Key** → 이름 `hyanggirok`, 권한 **Sending access** → 만든 키를 복사해요. → `RESEND_API_KEY`
3. 보내는 사람 주소 → `NEWSLETTER_FROM`
   - **도메인이 없으면**: `Parfumoir <onboarding@resend.dev>` 로 두세요. 이 경우 **Resend에 가입한 내 이메일로만** 보낼 수 있어서 테스트용이에요.
   - **구독자에게 실제로 보내려면** 도메인이 필요해요(예: `parfumoir.kr`, 1년 1~2만 원). Resend의 **Domains → Add Domain**에서 도메인을 등록하고 안내된 DNS 값을 도메인 구입처에 넣으면 돼요. 그 뒤 `Parfumoir <letter@내도메인>` 처럼 바꿔요.

## 3. (선택) Claude API — AI 추천

1. [console.anthropic.com](https://console.anthropic.com)에서 가입하고 결제 수단을 등록해요. (추천 1회에 몇 원 수준)
2. **API Keys → Create Key** → 복사 → `ANTHROPIC_API_KEY`
3. 키를 넣지 않아도 사이트는 동작해요. 그때는 노트·계열이 겹치는 정도로 추천해요.

## 4. Vercel — 사이트 배포

1. [vercel.com](https://vercel.com) → **Sign Up** → **Continue with GitHub**로 가입해요.
2. **Add New… → Project** → 목록에서 **perfume** 저장소 옆 **Import**를 눌러요.
   - 저장소가 안 보이면 **Adjust GitHub App Permissions**를 눌러 perfume 저장소 접근을 허락해요.
3. **Environment Variables** 칸을 펼치고 아래를 하나씩 추가해요. (Key에 이름, Value에 값)

   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | 1단계 Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 1단계 anon 키 |
   | `SUPABASE_SERVICE_ROLE_KEY` | 1단계 service_role 키 |
   | `NEXT_PUBLIC_SITE_URL` | 일단 `https://perfume.vercel.app` (5단계에서 실제 주소로 고쳐요) |
   | `RESEND_API_KEY` | 2단계 키 |
   | `NEWSLETTER_FROM` | `Parfumoir <onboarding@resend.dev>` |
   | `ANTHROPIC_API_KEY` | 3단계 키 (없으면 생략) |
   | `ANTHROPIC_MODEL` | `claude-sonnet-5` |

4. **Deploy**를 눌러요. 2~3분 뒤 축하 화면이 나오면 성공이에요.
   - 빨간 오류가 나오면 **Build Logs**의 빨간 줄을 캡처해서 Claude에게 보여 주세요.

## 5. 주소 연결 마무리

1. Vercel 프로젝트 화면 위쪽 **Domains**에 적힌 주소(예: `perfume-xxxx.vercel.app`)를 복사해요.
2. Vercel **Settings → Environment Variables**에서 `NEXT_PUBLIC_SITE_URL`을 `https://그주소`로 고치고, **Deployments** 탭에서 최신 배포의 **⋯ → Redeploy**를 눌러요.
3. Supabase **Authentication → URL Configuration**에서
   - **Site URL**: `https://그주소`
   - **Redirect URLs** → **Add URL**: `https://그주소/**`
   - **Save**

## 6. 나를 관리자로 지정하기

1. 내 사이트에서 **로그인 → 회원가입** 탭에서 이메일과 비밀번호로 가입해요.
   (Supabase **Authentication → Sign In / Providers → Email**에서 **Confirm email**을 꺼 두면 메일 없이 바로 가입돼요.)
2. Supabase **SQL Editor**에서 아래를 붙여넣고, 이메일만 내 것으로 바꿔 **Run** 해요.

   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = '내이메일@gmail.com');
   ```

3. 사이트를 새로고침하면 위쪽에 **관리** 버튼이 생겨요.
   - 향수 상세 화면의 **리뷰 수정**으로 예시 리뷰(“예시” 표시)를 내 리뷰로 바꿔 주세요.
   - 예시 뉴스레터 두 편은 각 호 화면 아래 **이 호 삭제**로 지울 수 있어요.

---

## 기능별 위치

| 기능 | 위치 | 누가 |
| --- | --- | --- |
| 향수 목록·검색(한글·노트 검색) | `/` | 누구나 |
| 큐레이터 리뷰 쓰기·수정 | 향수 상세 → 리뷰 수정 | 관리자 |
| 인용 리뷰 | 향수 상세 → 인용해서 리뷰 쓰기 | 로그인 이용자 |
| 내 컬렉션 / 위시리스트 / 향뿌캘린더 | 각 탭 | 로그인 이용자 (본인만 보임) |
| AI 추천 3~4병 | 위시리스트 탭 | 로그인 이용자 |
| 신향 추가 요청·“나도 요청” | 검색 결과 없음 / 신향 요청 탭 | 로그인 이용자 |
| 요청 → 등록하기 / 보류 | 신향 요청 탭 | 관리자 |
| 새 향수 등록 (등록 후 30일 NEW) | 관리 → 새 향수 등록 | 관리자 |
| 뉴스레터 읽기 | 뉴스레터 탭 | 누구나 |
| 메일 구독 (확인 메일 → 확정) | 뉴스레터 탭 | 누구나 |
| 뉴스레터 발행·메일 발송·테스트 발송 | 관리 / 각 호 화면 | 관리자 |

## 알아 두면 좋은 것

- **로그인 방식**: 이메일 + 비밀번호예요. 로그인 메일을 보내지 않아서 Supabase 메일 한도에 걸리지 않아요. 비밀번호는 **내 정보**(오른쪽 위 닉네임)에서 바꿀 수 있어요.
- **구독자 이메일**은 서버에서만 읽을 수 있고 브라우저로는 절대 전달되지 않아요.
- **메일마다 개인 구독취소 링크**가 들어가고, Gmail·네이버 메일의 “구독 취소” 버튼도 동작해요.
- 이 저장소는 공개(Public)예요. 키는 코드에 없고 Vercel 환경 변수에만 있어요. `.env` 파일을 만들어 올리지 마세요.

## 폴더 구조

```
app/                 화면(페이지)과 서버 동작
  actions.ts         저장·삭제 등 서버 액션
  api/recommend      AI 추천
  api/unsubscribe    구독 취소
  admin/             관리 화면
components/          화면 조각
lib/                 Supabase 연결, 메일, 추천 로직
supabase/schema.sql  데이터베이스 구조와 보안 규칙
supabase/seed.sql    샘플 데이터
```
