"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { postQuote, deleteQuote } from "@/app/actions";
import { QuoteIcon } from "./Icons";

export function RatingInput({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="rate" role="group" aria-label={label}>
      <span className="rate-label">{label}</span>
      {[1, 2, 3, 4, 5].map((i) => (
        <button type="button" key={i} aria-pressed={i === value} onClick={() => onChange(i)}>{i}</button>
      ))}
    </div>
  );
}

export function QuoteComposer({ perfumeId, perfumeName, loggedIn, embed }: {
  perfumeId: string; perfumeName: string; loggedIn: boolean; embed: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!open)
    return (
      <button className="btn primary" onClick={() => (loggedIn ? setOpen(true) : router.push("/login"))}>
        <QuoteIcon /> 인용해서 리뷰 쓰기
      </button>
    );
  return (
    <div className="composer" style={{ marginTop: 14, width: "100%" }}>
      <RatingInput value={rating} onChange={setRating} label="내 평점" />
      <textarea
        rows={3}
        maxLength={500}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`이 리뷰에 대한 내 생각, 내가 맡은 ${perfumeName}는 어땠나요?`}
        autoFocus
      />
      {embed}
      <div className="row-end">
        <button className="btn ghost" onClick={() => setOpen(false)}>취소</button>
        <button
          className="btn primary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await postQuote(perfumeId, text, rating || null);
              if (r.ok) { setText(""); setRating(0); setOpen(false); setMsg(""); router.refresh(); }
              else setMsg(r.message ?? "게시하지 못했어요.");
            })
          }
        >
          {pending ? "게시 중…" : "인용 게시"}
        </button>
      </div>
      {msg && <p className="muted" role="alert" style={{ margin: 0, fontSize: 13 }}>{msg}</p>}
    </div>
  );
}

export function DeleteQuoteButton({ quoteId, perfumeId }: { quoteId: string; perfumeId: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!confirm) return <button className="btn ghost" onClick={() => setConfirm(true)}>삭제</button>;
  return (
    <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <span className="muted" style={{ fontSize: 13 }}>삭제할까요?</span>
      <button className="btn ghost" onClick={() => setConfirm(false)}>취소</button>
      <button className="btn" disabled={pending} onClick={() => start(async () => { await deleteQuote(quoteId, perfumeId); router.refresh(); })}>삭제</button>
    </span>
  );
}
