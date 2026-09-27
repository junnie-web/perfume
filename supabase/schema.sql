-- ============================================================
-- 향기록 데이터베이스 스키마
-- Supabase 대시보드 → SQL Editor → New query 에 전체를 붙여넣고 Run.
-- 여러 번 실행해도 안전하도록 작성했어요.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- 회원 프로필 ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '향기록 이용자',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- 가입하면 프로필 자동 생성 (닉네임은 이메일 앞부분)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(split_part(new.email, '@', 1), '향기록 이용자'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 관리자 여부 확인 함수
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------- 향수 카탈로그 ----------
create table if not exists public.perfumes (
  id text primary key,                 -- 예: lelabo-santal33
  brand text not null,
  brand_ko text,
  name text not null,
  name_ko text,
  conc text not null default 'EDP',    -- EDP / EDT / Parfum / Cologne
  family text not null,                -- 우디, 플로럴 ...
  year int,
  top text[] not null default '{}',
  heart text[] not null default '{}',
  base text[] not null default '{}',
  seasons text[] not null default '{}',
  mood text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 큐레이터(사이트 주인)의 리뷰: 향수당 하나
create table if not exists public.curator_reviews (
  perfume_id text primary key references public.perfumes(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  longevity int not null check (longevity between 1 and 5),
  sillage int not null check (sillage between 1 and 5),
  body text not null,
  is_example boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 이용자 인용 리뷰
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  perfume_id text not null references public.perfumes(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  rating int check (rating between 1 and 5),
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists quotes_perfume_idx on public.quotes (perfume_id, created_at desc);

-- ---------- 개인 기록 (본인만 보고 쓸 수 있음) ----------
create table if not exists public.wishlist (
  user_id uuid not null references public.profiles(id) on delete cascade,
  perfume_id text not null references public.perfumes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, perfume_id)
);

create table if not exists public.collection (
  user_id uuid not null references public.profiles(id) on delete cascade,
  perfume_id text not null references public.perfumes(id) on delete cascade,
  memo text,
  added_at timestamptz not null default now(),
  primary key (user_id, perfume_id)
);

create table if not exists public.wear_logs (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  perfume_id text not null references public.perfumes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, day, perfume_id)
);

create table if not exists public.day_memos (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  memo text not null,
  primary key (user_id, day)
);

-- ---------- 신향 추가 요청 (노래방 신곡 신청 방식) ----------
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,            -- 브랜드+이름을 정규화한 값 (중복 요청 방지)
  brand text not null,
  name text not null,
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','added','rejected')),
  perfume_id text references public.perfumes(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.request_votes (
  request_id uuid not null references public.requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (request_id, user_id)
);

create or replace view public.request_board with (security_invoker = on) as
  select r.*, count(v.user_id)::int as votes
  from public.requests r
  left join public.request_votes v on v.request_id = r.id
  group by r.id;

-- ---------- 뉴스레터 ----------
create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  vol int not null unique,
  title text not null,
  body text not null,
  is_example boolean not null default false,
  published_at timestamptz not null default now(),
  sent_at timestamptz,
  sent_count int
);

-- 구독자: 이메일은 관리자만(서버에서 service role 키로) 접근
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  token uuid not null default gen_random_uuid(),   -- 확인/구독취소 링크용
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);

-- ============================================================
-- 보안 규칙 (Row Level Security)
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.perfumes        enable row level security;
alter table public.curator_reviews enable row level security;
alter table public.quotes          enable row level security;
alter table public.wishlist        enable row level security;
alter table public.collection      enable row level security;
alter table public.wear_logs       enable row level security;
alter table public.day_memos       enable row level security;
alter table public.requests        enable row level security;
alter table public.request_votes   enable row level security;
alter table public.newsletters     enable row level security;
alter table public.subscribers     enable row level security;  -- 정책 없음 = 브라우저에서 접근 불가

-- 프로필: 닉네임은 누구나 보기, 본인만 닉네임 수정 (관리자 권한 칸은 수정 불가)
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select using (true);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);
revoke update on public.profiles from authenticated, anon;
grant update (display_name) on public.profiles to authenticated;

-- 카탈로그·큐레이터 리뷰·뉴스레터: 누구나 읽기, 관리자만 쓰기
do $$
declare t text;
begin
  foreach t in array array['perfumes','curator_reviews','newsletters'] loop
    execute format('drop policy if exists "%1$s read" on public.%1$s', t);
    execute format('create policy "%1$s read" on public.%1$s for select using (true)', t);
    execute format('drop policy if exists "%1$s admin write" on public.%1$s', t);
    execute format('create policy "%1$s admin write" on public.%1$s for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- 인용 리뷰: 누구나 읽기, 로그인한 본인 이름으로 쓰기, 본인 또는 관리자만 삭제
drop policy if exists "quotes read" on public.quotes;
create policy "quotes read" on public.quotes for select using (true);
drop policy if exists "quotes insert own" on public.quotes;
create policy "quotes insert own" on public.quotes for insert with check (auth.uid() = author_id);
drop policy if exists "quotes delete own" on public.quotes;
create policy "quotes delete own" on public.quotes for delete using (auth.uid() = author_id or public.is_admin());

-- 개인 기록: 본인만
do $$
declare t text;
begin
  foreach t in array array['wishlist','collection','wear_logs','day_memos'] loop
    execute format('drop policy if exists "%1$s own" on public.%1$s', t);
    execute format('create policy "%1$s own" on public.%1$s for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

-- 요청: 누구나 보기, 로그인하면 요청 올리기, 상태 변경은 관리자만
drop policy if exists "requests read" on public.requests;
create policy "requests read" on public.requests for select using (true);
drop policy if exists "requests insert" on public.requests;
create policy "requests insert" on public.requests for insert with check (auth.uid() = created_by and status = 'pending');
drop policy if exists "requests admin" on public.requests;
create policy "requests admin" on public.requests for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "requests admin delete" on public.requests;
create policy "requests admin delete" on public.requests for delete using (public.is_admin());

-- 요청 투표: 누구나 개수 보기, 본인 표만 넣고 빼기
drop policy if exists "votes read" on public.request_votes;
create policy "votes read" on public.request_votes for select using (true);
drop policy if exists "votes own insert" on public.request_votes;
create policy "votes own insert" on public.request_votes for insert with check (auth.uid() = user_id);
drop policy if exists "votes own delete" on public.request_votes;
create policy "votes own delete" on public.request_votes for delete using (auth.uid() = user_id);

grant select on public.request_board to anon, authenticated;
