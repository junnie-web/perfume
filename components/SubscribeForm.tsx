"use client";
import { useState, useTransition } from "react";
import { subscribe } from "@/app/actions";

export default function SubscribeForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className={`subbox ${ok ? "on" : ""}`}>
      <div>
        <div className="eyebrow">메일로 받아보기</div>
        <h3>새 호가 나오면 메일함으로 보내드려요</h3>
        <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>한 달에 한두 번, 향 이야기와 이번 달 추천. 메일마다 있는 링크로 언제든 구독을 취소할 수 있어요.</p>
      </div>
      <form
        className="formgrid"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await subscribe(email);
            setOk(r.ok);
            setMsg(r.message ?? "");
          });
        }}
      >
        <div className="subform">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" aria-label="구독할 이메일" required />
          <button className="btn primary" disabled={pending}>{pending ? "보내는 중…" : "구독하기"}</button>
        </div>
        {msg && <p role="status" style={{ margin: 0, fontSize: 13 }}>{msg}</p>}
      </form>
    </div>
  );
}
