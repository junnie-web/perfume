"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addWear, removeWear, saveDayMemo } from "@/app/actions";
import { FAMILIES, famColor } from "@/lib/utils";

type P = { id: string; brand: string; name: string; family: string };
type Props = {
  month: string; // YYYY-MM
  logs: { day: string; perfume_id: string }[];
  memos: { day: string; memo: string }[];
  perfumes: P[];
  ownedIds: string[];
};
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function CalendarView({ month, logs, memos, perfumes, ownedIds }: Props) {
  const [y, m] = month.split("-").map(Number);
  const [today, setToday] = useState("");
  const [sel, setSel] = useState(`${month}-01`);
  const [pick, setPick] = useState("");
  const [memo, setMemo] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const t = ymd(new Date());
    setToday(t);
    setSel(t.startsWith(month) ? t : `${month}-01`);
  }, [month]);

  const byId = Object.fromEntries(perfumes.map((p) => [p.id, p]));
  const byDay: Record<string, P[]> = {};
  for (const l of logs) if (byId[l.perfume_id]) (byDay[l.day] ??= []).push(byId[l.perfume_id]);
  const memoByDay = Object.fromEntries(memos.map((x) => [x.day, x.memo]));
  useEffect(() => setMemo(memoByDay[sel] ?? ""), [sel, memos]); // eslint-disable-line

  const first = new Date(y, m - 1, 1).getDay();
  const days = new Date(y, m, 0).getDate();
  const prev = ymd(new Date(y, m - 2, 1)).slice(0, 7);
  const next = ymd(new Date(y, m, 1)).slice(0, 7);

  const counts: Record<string, number> = {};
  logs.forEach((l) => (counts[l.perfume_id] = (counts[l.perfume_id] ?? 0) + 1));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = top[0]?.[1] ?? 1;
  const wornDays = Object.keys(byDay).length;
  const sd = new Date(sel + "T00:00:00");
  const selWorn = byDay[sel] ?? [];
  const owned = new Set(ownedIds);

  const act = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  return (
    <div className="calw">
      <section>
        <div className="sec-h">
          <div className="calnav">
            <Link className="btn ghost" href={`/calendar?m=${prev}`} aria-label="이전 달">‹</Link>
            <h2>{y}. {String(m).padStart(2, "0")}</h2>
            <Link className="btn ghost" href={`/calendar?m=${next}`} aria-label="다음 달">›</Link>
          </div>
          <Link className="btn" href="/calendar">오늘</Link>
        </div>
        <div className="cal">
          {DOW.map((d) => <div key={d} className="dow">{d}</div>)}
          {Array.from({ length: first }, (_, i) => <div key={`e${i}`} className="day out" aria-hidden="true" />)}
          {Array.from({ length: days }, (_, i) => {
            const key = `${month}-${String(i + 1).padStart(2, "0")}`;
            const ps = byDay[key] ?? [];
            return (
              <button key={key} className={`day ${key === today ? "today" : ""}`} aria-pressed={sel === key} onClick={() => setSel(key)}
                aria-label={`${m}월 ${i + 1}일${ps.length ? ", " + ps.map((p) => p.name).join(", ") : ""}`}>
                <span className="d">{i + 1}</span>
                {ps.slice(0, 2).map((p) => (
                  <span key={p.id} className="w"><span className="dot" style={{ background: famColor(p.family) }} /><span>{p.name}</span></span>
                ))}
                {ps.length > 2 && <span className="more">+{ps.length - 2}</span>}
              </button>
            );
          })}
        </div>
        <div className="legend" style={{ marginTop: 12 }}>
          {Object.entries(FAMILIES).map(([f, c]) => <span key={f}><i className="dot" style={{ background: c }} />{f}</span>)}
        </div>
      </section>
      <aside style={{ display: "grid", gap: 16 }}>
        <div className="panel">
          <div><div className="eyebrow">{DOW[sd.getDay()]}요일</div><h3>{sd.getMonth() + 1}월 {sd.getDate()}일의 향</h3></div>
          <div className="worn">
            {selWorn.length ? selWorn.map((p) => (
              <div className="it" key={p.id}>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="dot" style={{ background: famColor(p.family) }} /><b>{p.name}</b>
                  <span className="muted" style={{ fontSize: 12 }}>{p.brand}</span>
                </span>
                <button className="btn ghost" disabled={pending} onClick={() => act(() => removeWear(sel, p.id))}>지우기</button>
              </div>
            )) : <span className="muted" style={{ fontSize: 13 }}>아직 기록이 없어요.</span>}
          </div>
          <div className="addrow">
            <select value={pick} onChange={(e) => setPick(e.target.value)} aria-label="뿌린 향수 고르기">
              <option value="">뿌린 향수 고르기</option>
              {ownedIds.length > 0 && (
                <optgroup label="내 컬렉션">
                  {perfumes.filter((p) => owned.has(p.id)).map((p) => <option key={p.id} value={p.id}>{p.brand} — {p.name}</option>)}
                </optgroup>
              )}
              <optgroup label="전체 향수">
                {perfumes.filter((p) => !owned.has(p.id)).map((p) => <option key={p.id} value={p.id}>{p.brand} — {p.name}</option>)}
              </optgroup>
            </select>
            <button className="btn primary" disabled={!pick || pending} onClick={() => act(async () => { await addWear(sel, pick); setPick(""); })}>기록</button>
          </div>
          <label className="f">메모
            <textarea rows={2} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="날씨, 장소, 들은 말" />
          </label>
          <div className="row-end"><button className="btn" disabled={pending} onClick={() => act(() => saveDayMemo(sel, memo))}>메모 저장</button></div>
        </div>
        <div className="panel">
          <div className="sec-h" style={{ margin: 0 }}><h3>{m}월 통계</h3><span className="mono muted">{wornDays}일 기록</span></div>
          {top.length ? (
            <div className="stats">
              {top.map(([id, c]) => byId[id] && (
                <div className="stat" key={id}>
                  <span>{byId[id].name}</span><span className="c">{c}회</span>
                  <span className="bar"><i style={{ width: `${(c / max) * 100}%` }} /></span>
                </div>
              ))}
            </div>
          ) : <span className="muted" style={{ fontSize: 13 }}>이번 달 기록이 쌓이면 가장 많이 뿌린 향이 보여요.</span>}
        </div>
      </aside>
    </div>
  );
}
