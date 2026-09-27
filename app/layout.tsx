import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { getViewer } from "@/lib/auth";
import SideNav from "@/components/SideNav";
import { NEW_DAYS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Parfumoir",
  description: "파퓨무아, 향의 회고록. 브랜드별 향수와 큐레이터 리뷰, 향뿌캘린더, 뉴스레터가 있는 향수 큐레이팅 사이트",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profile, isAdmin } = await getViewer();
  const since = new Date(Date.now() - NEW_DAYS * 864e5).toISOString();
  const [{ count: pending }, { data: perfumes }] = await Promise.all([
    supabase.from("requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("perfumes").select("brand, created_at"),
  ]);
  const counts: Record<string, number> = {};
  let newCount = 0;
  for (const p of perfumes ?? []) {
    counts[p.brand] = (counts[p.brand] ?? 0) + 1;
    if (p.created_at > since) newCount++;
  }
  const brands = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0])).map(([brand, count]) => ({ brand, count }));

  return (
    <html lang="ko">
      <head>
        {/* Pretendard: 한글·영문 모두 깔끔한 현대적 글꼴 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <div className="shell">
          <Suspense fallback={<aside className="sidenav" />}>
            <SideNav
              brands={brands}
              pending={pending ?? 0}
              newCount={newCount}
              user={user ? { name: profile?.display_name ?? "내 정보", isAdmin } : null}
            />
          </Suspense>
          <div className="content">
            <main>{children}</main>
            <footer className="site">Parfumoir · 향의 회고록</footer>
          </div>
        </div>
      </body>
    </html>
  );
}
