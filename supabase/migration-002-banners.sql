-- ============================================================
-- Parfumoir 업데이트 2: 메인 배너 슬라이드 · 메인 사진
-- Supabase → SQL Editor → + → 전체 붙여넣기 → Run (한 번만)
-- ============================================================

-- 배너 (메인 화면 새소식 슬라이드에 직접 올리는 것)
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,                 -- 작은 윗글 (예: 이벤트, 공지)
  title text not null,
  body text,
  link text,                    -- 눌렀을 때 갈 주소 (예: /perfumes/aesop-hwyl)
  image_url text,
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- 사이트 설정 (메인 사진 주소 등)
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.banners enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "banners read" on public.banners;
create policy "banners read" on public.banners for select using (true);
drop policy if exists "banners admin" on public.banners;
create policy "banners admin" on public.banners for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings read" on public.site_settings;
create policy "settings read" on public.site_settings for select using (true);
drop policy if exists "settings admin" on public.site_settings;
create policy "settings admin" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- 사진 보관함 (누구나 볼 수 있고, 올리기는 서버에서만)
insert into storage.buckets (id, name, public)
values ('site', 'site', true)
on conflict (id) do nothing;
