"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveCollectionMemo, toggleCollection } from "@/app/actions";
import { famColor } from "@/lib/utils";

export default function CollectionCard({ id, brand, name, family, conc, memo, wear }: {
  id: string; brand: string; name: string; family: string; conc: string; memo: string | null; wear: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(memo ?? "");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <article className="card bottle">
      <Link className="open" href={`/perfumes/${id}`}>
        <span className="bn">{brand}</span>
        <span className="nm">{name}</span>
        <span className="notes"><span className="dot" style={{ background: famColor(family) }} /> {family} · {conc}</span>
      </Link>
      {editing ? (
        <>
          <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="산 곳, 용량, 느낌" autoFocus />
          <div className="row-end">
            <button className="btn ghost" onClick={() => setEditing(false)}>취소</button>
            <button className="btn primary" disabled={pending} onClick={() => start(async () => { await saveCollectionMemo(id, text); setEditing(false); router.refresh(); })}>저장</button>
          </div>
        </>
      ) : memo ? <p className="memo">{memo}</p> : null}
      <div className="meta">
        <span className="mono muted">{wear}</span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
          <button className="btn ghost" onClick={() => setEditing(true)}>메모</button>
          <button className="btn ghost" disabled={pending} onClick={() => start(async () => { await toggleCollection(id, false); router.refresh(); })}>빼기</button>
        </span>
      </div>
    </article>
  );
}
