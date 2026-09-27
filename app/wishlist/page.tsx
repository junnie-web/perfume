import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import type { Perfume } from "@/lib/types";
import { notesOf } from "@/lib/utils";
import { ToggleButton } from "@/components/ToggleButtons";
import Recommend from "@/components/Recommend";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const { supabase, user } = await getViewer();
  if (!user) redirect("/login?next=/wishlist");
  const [{ data }, { count: owned }] = await Promise.all([
    supabase.from("wishlist").select("perfume_id, created_at, perfumes(*)").order("created_at", { ascending: false }),
    supabase.from("collection").select("perfume_id", { count: "exact", head: true }),
  ]);
  const items = (data ?? []).map((r: any) => r.perfumes as Perfume).filter(Boolean);
  return (
    <div className="wl">
      <section>
        <div className="sec-h"><h2>구매 위시리스트</h2><span className="mono muted">{items.length}병</span></div>
        {items.length ? (
          <div className="list">
            {items.map((p) => (
              <div className="li two-col" key={p.id}>
                <Link className="t" href={`/perfumes/${p.id}`}>
                  <b>{p.name}</b>
                  <span>{p.brand} · {p.family} · {notesOf(p).slice(0, 3).join(", ")}</span>
                </Link>
                <span style={{ display: "flex", gap: 2 }}>
                  <ToggleButton id={p.id} kind="own" on={false} loggedIn onLabel="샀어요 ✓" offLabel="샀어요" />
                  <ToggleButton id={p.id} kind="wish" on loggedIn onLabel="빼기" offLabel="다시 담기" className="ghost" />
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">향수 탭에서 하트를 눌러 담아 보세요.</div>
        )}
      </section>
      <section className="ai">
        <div className="eyebrow">For your wishlist</div>
        <h2>당신을 위한 향 3–4병</h2>
        <p className="lead">위시리스트, 내 컬렉션, 향뿌캘린더 기록을 바탕으로 아직 없는 향수 중에서 골라 드려요.</p>
        <Recommend disabled={items.length === 0 && !owned} />
      </section>
    </div>
  );
}
