import Link from "next/link";
import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth";
import type { CuratorReview, Perfume, Quote } from "@/lib/types";
import { ago, fmtDate, isNew, stars } from "@/lib/utils";
import FamDot from "@/components/FamDot";
import { ToggleButton, WearTodayButton } from "@/components/ToggleButtons";
import { QuoteComposer, DeleteQuoteButton } from "@/components/QuoteComposer";
import ReviewEditor from "@/components/ReviewEditor";

export const dynamic = "force-dynamic";

function Meter({ label, n }: { label: string; n: number }) {
  return (
    <div className="meter">
      {label}
      <span className="bars">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= n ? "f" : ""} />)}</span>
    </div>
  );
}

function Embed({ p, r }: { p: Perfume; r: CuratorReview | null }) {
  return (
    <div className="embed">
      <div className="eh">
        <div className="av sm" style={{ width: 18, height: 18, fontSize: 10 }}>향</div>
        큐레이터 · {p.name} {r && <span className="stars" style={{ fontSize: 11 }}>{stars(r.rating)}</span>}
      </div>
      {r && <div className="et">{r.body}</div>}
    </div>
  );
}

export default async function PerfumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, isAdmin } = await getViewer();
  const { data: p } = await supabase.from("perfumes").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  const perfume = p as Perfume;
  const [{ data: review }, { data: quotes }] = await Promise.all([
    supabase.from("curator_reviews").select("*").eq("perfume_id", id).maybeSingle(),
    supabase.from("quotes").select("*, profiles(display_name)").eq("perfume_id", id).order("created_at", { ascending: false }),
  ]);
  let wished = false, owned = false, wornDays: string[] = [];
  if (user) {
    const [w, c, logs] = await Promise.all([
      supabase.from("wishlist").select("perfume_id").eq("perfume_id", id).maybeSingle(),
      supabase.from("collection").select("perfume_id").eq("perfume_id", id).maybeSingle(),
      supabase.from("wear_logs").select("day").eq("perfume_id", id).order("day", { ascending: false }).limit(3),
    ]);
    wished = !!w.data; owned = !!c.data; wornDays = (logs.data ?? []).map((l) => l.day);
  }
  const r = review as CuratorReview | null;
  const qs = (quotes ?? []) as Quote[];
  const row = (k: string, items: string[], tag = false) => (
    <div className="row">
      <span className="k">{k}</span>
      <span className="v">{items.map((n) => <span key={n} className={tag ? "tag" : "chip"}>{n}</span>)}</span>
    </div>
  );

  return (
    <>
      <Link className="btn ghost back" href="/perfumes">← 전체 향수</Link>
      <div className="detail">
        <section className="dhead">
          <div className="bn">{perfume.brand}{perfume.brand_ko ? ` · ${perfume.brand_ko}` : ""}</div>
          <h2>{perfume.name}</h2>
          {perfume.name_ko && <div className="ko" style={{ marginTop: 6 }}>{perfume.name_ko}</div>}
          <div className="sub">
            {isNew(perfume) && <span className="new">NEW</span>}
            <FamDot family={perfume.family} />
            <span className="chip">{perfume.family}</span>
            <span className="tag">{perfume.conc}</span>
            {perfume.year && <span className="mono muted">{perfume.year}</span>}
          </div>
          <div className="actions">
            <ToggleButton id={id} kind="own" on={owned} loggedIn={!!user} onLabel="내 컬렉션에 있음" offLabel="갖고 있어요" />
            <ToggleButton id={id} kind="wish" on={wished} loggedIn={!!user} onLabel="위시리스트에 있음" offLabel="위시리스트에 담기" />
            <WearTodayButton id={id} loggedIn={!!user} wornDays={wornDays} />
          </div>
          <div className="pyramid">
            {row("TOP", perfume.top)}
            {row("HEART", perfume.heart)}
            {row("BASE", perfume.base)}
            {row("SEASON", [...perfume.seasons, ...perfume.mood], true)}
          </div>
        </section>

        <section>
          <article className="post">
            <div className="who">
              <div className="av">향</div>
              <div>
                <div className="n">큐레이터의 향 리뷰 {r?.is_example && <span className="tag ex">예시</span>}</div>
                <div className="mono muted">{r ? fmtDate(r.updated_at) : "아직 리뷰를 쓰지 않았어요"}</div>
              </div>
              {r && <span className="stars" style={{ marginLeft: "auto" }} aria-label={`별점 ${r.rating}점`}>{stars(r.rating)}</span>}
            </div>
            {r && (
              <>
                <p className="body">{r.body}</p>
                <div className="meters"><Meter label="지속력" n={r.longevity} /><Meter label="확산력" n={r.sillage} /></div>
              </>
            )}
            <div className="foot">
              <span className="muted" style={{ fontSize: 13 }}>인용 {qs.length}</span>
              <span style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {isAdmin && <ReviewEditor perfumeId={id} perfumeName={perfume.name} review={r} />}
                {r && <QuoteComposer perfumeId={id} perfumeName={perfume.name} loggedIn={!!user} embed={<Embed p={perfume} r={r} />} />}
              </span>
            </div>
          </article>

          <div className="quotes-h"><h3>인용 리뷰</h3><span className="mono muted">{qs.length}</span></div>
          <div className="qlist">
            {qs.length === 0 && <div className="empty">첫 번째로 인용해 보세요.</div>}
            {qs.map((q) => (
              <article key={q.id} className="q">
                <div className="who">
                  <div className="av sm" style={{ background: "var(--sunk)", color: "var(--ink)" }}>{(q.profiles?.display_name ?? "?").slice(0, 1)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="n">{q.profiles?.display_name ?? "Parfumoir 이용자"}{q.author_id === user?.id ? " (나)" : ""}</div>
                    <div className="mono muted">{ago(q.created_at)}</div>
                  </div>
                  {q.rating && <span className="stars" style={{ marginLeft: "auto" }}>{stars(q.rating)}</span>}
                </div>
                <p className="txt">{q.body}</p>
                <Embed p={perfume} r={r} />
                {(q.author_id === user?.id || isAdmin) && (
                  <div className="row-end" style={{ marginTop: 8 }}><DeleteQuoteButton quoteId={q.id} perfumeId={id} /></div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
