"use client";
import Link from "next/link";
import { useRef, useState } from "react";

type Rec = { source: "ai" | "local"; taste: string; picks: { id: string; why: string; name: string; brand: string; family: string }[]; note?: string };

export default function Recommend({ disabled }: { disabled: boolean }) {
  const [rec, setRec] = useState<Rec | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const ctl = useRef<AbortController | null>(null);

  async function run() {
    setLoading(true); setErr("");
    ctl.current = new AbortController();
    try {
      const res = await fetch("/api/recommend", { method: "POST", signal: ctl.current.signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "추천을 받지 못했어요.");
      setRec(data);
    } catch (e: any) {
      if (e?.name !== "AbortError") setErr(e?.message ?? "추천을 받지 못했어요.");
    } finally { setLoading(false); }
  }

  if (disabled)
    return (<><button className="btn primary" disabled>추천받기</button>
      <p className="lead" style={{ marginTop: 12 }}>위시리스트나 컬렉션에 한 병 이상 담으면 추천을 받을 수 있어요.</p></>);
  if (loading)
    return (<><div className="thinking"><span className="mist" />위시리스트의 노트를 맡아 보는 중…</div>
      <button className="btn" onClick={() => ctl.current?.abort()}>중단</button></>);
  return (
    <>
      {rec && (
        <>
          {rec.taste && <p className="taste">{rec.taste}</p>}
          <div className="recs">
            {rec.picks.map((r, i) => (
              <Link key={r.id} className="rec" href={`/perfumes/${r.id}`} style={{ textDecoration: "none" }}>
                <span className="no">{String(i + 1).padStart(2, "0")} · {r.family}</span>
                <span className="bn">{r.brand}</span>
                <b>{r.name}</b>
                <p>{r.why}</p>
              </Link>
            ))}
          </div>
          <p className="lead" style={{ margin: "12px 0 0", fontSize: 12 }}>
            {rec.source === "ai" ? "Claude가 고른 추천이에요." : "노트와 계열이 겹치는 정도로 고른 추천이에요."} {rec.note ?? ""}
          </p>
        </>
      )}
      {err && <p className="lead" style={{ marginTop: 12 }}>{err}</p>}
      <div style={{ marginTop: 16 }}><button className="btn primary" onClick={run}>{rec ? "다시 추천받기" : "추천받기"}</button></div>
    </>
  );
}
