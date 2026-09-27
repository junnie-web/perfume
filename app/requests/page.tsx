import Link from "next/link";
import { getViewer } from "@/lib/auth";
import type { Perfume, RequestRow } from "@/lib/types";
import { ago, fmtDate, isNew } from "@/lib/utils";
import RequestForm from "@/components/RequestForm";
import RequestActions from "@/components/RequestActions";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const { supabase, user, isAdmin } = await getViewer();
  const [{ data: board }, { data: fresh }, { data: myVotes }] = await Promise.all([
    supabase.from("request_board").select("*").order("votes", { ascending: false }).order("created_at"),
    supabase.from("perfumes").select("*").order("created_at", { ascending: false }).limit(8),
    user ? supabase.from("request_votes").select("request_id").eq("user_id", user.id) : Promise.resolve({ data: [] as { request_id: string }[] }),
  ]);
  const mine = new Set((myVotes ?? []).map((v) => v.request_id));
  const all = (board ?? []) as RequestRow[];
  const pend = all.filter((r) => r.status === "pending" && r.votes > 0);
  const done = all.filter((r) => r.status !== "pending");
  const totalVotes = pend.reduce((a, r) => a + r.votes, 0);
  const newOnes = ((fresh ?? []) as Perfume[]).filter(isNew);
  const max = Math.max(1, ...pend.map((r) => r.votes));

  const Row = ({ r, i }: { r: RequestRow; i?: number }) => (
    <div className={`req ${r.status === "added" ? "done" : ""} ${r.status === "rejected" ? "rej" : ""}`}>
      <span className="rank">{r.status === "pending" && i !== undefined ? String(i + 1).padStart(2, "0") : r.status === "added" ? "✓" : "–"}</span>
      <div className="rt">
        <span className="bn">{r.brand}</span>
        <b>{r.name}</b>
        {r.status === "pending" && <span className="vbar"><i style={{ width: `${(r.votes / max) * 100}%` }} /></span>}
        <span className="mono muted">{r.status === "added" ? "등록 완료" : r.status === "rejected" ? "이번엔 보류" : `요청 ${ago(r.created_at)}`}</span>
      </div>
      <div className="ra">
        <span className="votes"><b>{r.votes}</b><span>명</span></span>
        <RequestActions id={r.id} brand={r.brand} name={r.name} status={r.status} perfumeId={r.perfume_id}
          mine={mine.has(r.id)} loggedIn={!!user} isAdmin={isAdmin} />
      </div>
    </div>
  );

  return (
    <div className="board">
      <div className="scoreboard">
        <div><span className="eyebrow">대기 중인 요청</span><span><span className="big">{pend.length}</span><span className="unit">건</span></span></div>
        <div><span className="eyebrow">누적 요청 수</span><span><span className="big">{totalVotes}</span><span className="unit">표</span></span></div>
        <div><span className="eyebrow">최근 30일 신제품</span><span><span className="big">{newOnes.length}</span><span className="unit">병</span></span></div>
      </div>
      <div className="reqw">
        <section>
          <div className="sec-h"><h2>추가 요청 순위</h2><span className="mono muted">표가 많은 순</span></div>
          {pend.length ? <div className="reqs">{pend.map((r, i) => <Row key={r.id} r={r} i={i} />)}</div>
            : <div className="empty">아직 쌓인 요청이 없어요. 찾는 향수가 없다면 첫 요청을 올려 주세요.</div>}
          {done.length > 0 && (
            <details className="donelist">
              <summary>처리된 요청 {done.length}건</summary>
              <div className="reqs">{done.map((r) => <Row key={r.id} r={r} />)}</div>
            </details>
          )}
        </section>
        <aside style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="panel">
            <h3>향수 추가 요청</h3>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>같은 향수를 요청한 사람이 많을수록 먼저 등록돼요.</p>
            <RequestForm loggedIn={!!user} />
          </div>
          <div className="panel">
            <div className="sec-h" style={{ margin: 0 }}><h3>신제품 입고</h3><span className="mono muted">최근 등록</span></div>
            {newOnes.length ? (
              <div className="list">
                {newOnes.map((p) => (
                  <div className="li one-col" key={p.id}>
                    <Link className="t" href={`/perfumes/${p.id}`}>
                      <b style={{ fontSize: 18 }}><span className="new">NEW</span>{p.name}</b>
                      <span>{p.brand} · {fmtDate(p.created_at)}</span>
                    </Link>
                  </div>
                ))}
              </div>
            ) : <span className="muted" style={{ fontSize: 13 }}>새로 등록되는 향수가 여기에 NEW 표시와 함께 올라와요.</span>}
          </div>
        </aside>
      </div>
    </div>
  );
}
