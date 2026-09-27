"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveReview } from "@/app/actions";
import { RatingInput } from "./QuoteComposer";
import type { CuratorReview } from "@/lib/types";

export default function ReviewEditor({ perfumeId, perfumeName, review }: { perfumeId: string; perfumeName: string; review: CuratorReview | null }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(review?.rating ?? 4);
  const [lon, setLon] = useState(review?.longevity ?? 3);
  const [sil, setSil] = useState(review?.sillage ?? 3);
  const [body, setBody] = useState(review && !review.is_example ? review.body : "");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!open) return <button className="btn ghost" onClick={() => setOpen(true)}>{review ? "리뷰 수정" : "리뷰 쓰기"}</button>;
  return (
    <div className="owner" style={{ marginTop: 14 }}>
      <h3>{perfumeName} 리뷰</h3>
      <RatingInput value={rating} onChange={setRating} label="평점" />
      <textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="첫 스프레이부터 잔향까지, 어떤 향이었나요?" />
      <div className="two">
        <label className="f">지속력 (1–5)
          <select value={lon} onChange={(e) => setLon(+e.target.value)}>{[1, 2, 3, 4, 5].map((i) => <option key={i}>{i}</option>)}</select>
        </label>
        <label className="f">확산력 (1–5)
          <select value={sil} onChange={(e) => setSil(+e.target.value)}>{[1, 2, 3, 4, 5].map((i) => <option key={i}>{i}</option>)}</select>
        </label>
      </div>
      <div className="row-end">
        <button className="btn ghost" onClick={() => setOpen(false)}>취소</button>
        <button className="btn primary" disabled={pending} onClick={() => start(async () => {
          const r = await saveReview(perfumeId, { rating, longevity: lon, sillage: sil, body });
          setMsg(r.message ?? "");
          if (r.ok) { setOpen(false); router.refresh(); }
        })}>{pending ? "저장 중…" : "리뷰 게시"}</button>
      </div>
      {msg && <p className="muted" role="status" style={{ margin: 0, fontSize: 13 }}>{msg}</p>}
    </div>
  );
}
