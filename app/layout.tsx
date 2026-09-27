import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getViewer } from "@/lib/auth";
import NavTabs from "@/components/NavTabs";

export const metadata: Metadata = {
  title: "향기록",
  description: "브랜드별 향수와 큐레이터 리뷰, 향뿌캘린더, 뉴스레터가 있는 향수 큐레이팅 사이트",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profile, isAdmin } = await getViewer();
  const { count: pending } = await supabase
    .from("requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+KR:wght@400;500;600&family=Italiana&display=swap"
        />
      </head>
      <body>
        <div className="wrap">
          <header>
            <div className="top">
              <Link href="/" className="mark" style={{ textDecoration: "none" }}>
                <h1>향기록</h1>
                <span className="latin">a scent journal</span>
              </Link>
              <div className="nav-right">
                {user ? (
                  <>
                    <Link className="userchip" href="/me">{profile?.display_name ?? "내 정보"}</Link>
                    {isAdmin && <Link className="btn" href="/admin">관리</Link>}
                    <form action="/auth/signout" method="post">
                      <button className="btn ghost" type="submit">로그아웃</button>
                    </form>
                  </>
                ) : (
                  <Link className="btn primary" href="/login">로그인</Link>
                )}
              </div>
            </div>
            <NavTabs pending={pending ?? 0} />
          </header>
          <main>{children}</main>
          <footer className="site">향기록 · 향을 기록하는 곳</footer>
        </div>
      </body>
    </html>
  );
}
