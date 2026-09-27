import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import type { Perfume } from "@/lib/types";
import { famColor, fmtDate } from "@/lib/utils";
import CollectionCard from "@/components/CollectionCard";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const { sort = "recent" } = await searchParams;
  const { supabase, user } = await getViewer();
  if (!user) redirect("/login?next=/collection");
  const [{ data: rows }, { data: logs }] = await Promise.all([
    supabase.from("collection").select("perfume_id, memo, added_at, perfumes(*)"),
    supabase.from("wear_logs").select("perfume_id, day"),
  ]);
  const count: Record<string, number> = {}, last: Record<string, string> = {};
  for (const l of logs ?? []) {
    count[l.perfume_id] = (count[l.perfume_id] ?? 0) + 1;
    if (!last[l.perfume_id] || l.day > last[l.perfume_id]) last[l.perfume_id] = l.day;
  }
  let items = (rows ?? [])
    .map((r: any) => ({ ...r, p: r.perfumes as Perfume }))
    .filter((r) => r.p);
  if (sort === "worn") items.sort((a, b) => (count[b.perfume_id] ?? 0) - (count[a.perfume_id] ?? 0));
  else if (sort === "brand") items.sort((a, b) => a.p.brand.localeCompare(b.p.brand) || a.p.name.localeCompare(b.p.name));
  else items.sort((a, b) => b.added_at.localeCompare(a.added_at));

  if (!items.length)
    return (
      <>
        <div className="sec-h"><h2>내 컬렉션</h2></div>
        <div className="empty">
          갖고 있는 향수를 모아 두는 곳이에요.<br />
          향수 페이지에서 <b>갖고 있어요</b>를 누르거나, 위시리스트에서 <b>샀어요</b>를 누르면 여기로 옮겨져요.<br /><br />
          <Link className="btn primary" href="/">향수 둘러보기</Link>
        </div>
      </>
    );

  const fam: Record<string, number> = {};
  items.forEach((c) => (fam[c.p.family] = (fam[c.p.family] ?? 0) + 1));
  const famE = Object.entries(fam).sort((a, b) => b[1] - a[1]);
  const monthAgo = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const sleeping = items.filter((c) => !last[c.perfume_id] || last[c.perfume_id] < monthAgo);

  return (
    <>
      <div className="sec-h">
        <h2>내 컬렉션</h2>
        <div className="seg" role="group" aria-label="정렬">
          {[["recent", "최근 추가"], ["worn", "많이 뿌린 순"], ["brand", "브랜드"]].map(([k, l]) => (
            <Link key={k} href={`/collection?sort=${k}`} aria-current={sort === k ? "true" : undefined}
              style={{ padding: "5px 12px", borderRadius: 999, fontSize: 13, textDecoration: "none",
                background: sort === k ? "var(--ink)" : "none", color: sort === k ? "var(--bg)" : "var(--muted)" }}>{l}</Link>
          ))}
        </div>
      </div>
      <div className="colsum">
        <div><span className="big">{items.length}</span><span className="muted">병</span></div>
        <div className="fambar" aria-label="계열 분포">
          {famE.map(([f, n]) => <i key={f} style={{ flex: n, background: famColor(f) }} title={`${f} ${n}병`} />)}
        </div>
        <div className="legend">{famE.map(([f, n]) => <span key={f}><i className="dot" style={{ background: famColor(f) }} />{f} {n}</span>)}</div>
        {sleeping.length > 0 && (
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            한 달 넘게 안 뿌린 병: {sleeping.slice(0, 4).map((c) => c.p.name).join(", ")}{sleeping.length > 4 ? ` 외 ${sleeping.length - 4}병` : ""}
          </p>
        )}
      </div>
      <div className="grid">
        {items.map((c) => (
          <CollectionCard key={c.perfume_id} id={c.perfume_id} brand={c.p.brand} name={c.p.name} family={c.p.family} conc={c.p.conc}
            memo={c.memo} wear={count[c.perfume_id] ? `${count[c.perfume_id]}회 · 최근 ${fmtDate(last[c.perfume_id]).slice(5)}` : "아직 안 뿌림"} />
        ))}
      </div>
    </>
  );
}
