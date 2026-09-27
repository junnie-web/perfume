"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendNewsletter, deleteNewsletter } from "@/app/actions";
import { fmtDate, vol2 } from "@/lib/utils";

export default function NewsletterSendPanel({ id, vol, sentAt, sentCount, subCount }: {
  id: string; vol: number; sentAt: string | null; sentCount: number | null; subCount: number;
}) {
  const [confirm, setConfirm] = useState<"" | "send" | "delete">("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: boolean; message?: string }>) =>
    start(async () => { const r = await fn(); setMsg(r.message ?? ""); setConfirm(""); router.refresh(); });
  return (
    <div className="owner" style={{ marginTop: 28 }}>
      <div className="sec-h" style={{ margin: 0 }}><h3>메일 발송</h3><span className="mono muted">구독자 {subCount}명</span></div>
      <p className="muted" style={{ margin: 0, fontSize: 13 }}>
        {sentAt ? `${fmtDate(sentAt)}에 ${sentCount}명에게 보냈어요.` : "아직 메일로 보내지 않은 호예요."} 구독자마다 따로 발송돼서 서로의 주소는 보이지 않아요.
      </p>
      {confirm === "send" ? (
        <div className="confirm">
          <b>구독자 {subCount}명에게 &lsquo;Vol. {vol2(vol)}&rsquo;을 보낼까요?</b>{sentAt && " 이미 보낸 호라 같은 메일을 또 받게 돼요."}
          <div className="row-end">
            <button className="btn ghost" onClick={() => setConfirm("")}>취소</button>
            <button className="btn primary" disabled={pending} onClick={() => run(() => sendNewsletter(id, false))}>보내기</button>
          </div>
        </div>
      ) : confirm === "delete" ? (
        <div className="confirm">
          <b>이 호를 삭제할까요? 되돌릴 수 없어요.</b>
          <div className="row-end">
            <button className="btn ghost" onClick={() => setConfirm("")}>취소</button>
            <button className="btn" disabled={pending} onClick={() => start(async () => { await deleteNewsletter(id); router.push("/newsletter"); })}>삭제</button>
          </div>
        </div>
      ) : (
        <div className="row-end">
          <button className="btn ghost" onClick={() => setConfirm("delete")}>이 호 삭제</button>
          <button className="btn" disabled={pending} onClick={() => run(() => sendNewsletter(id, true))}>나에게 테스트 발송</button>
          <button className="btn primary" disabled={pending || !subCount} onClick={() => setConfirm("send")}>구독자에게 메일 보내기</button>
        </div>
      )}
      {(pending || msg) && <p className="sendmsg" role="status">{pending && <span className="mist" />}{pending ? "처리 중…" : msg}</p>}
    </div>
  );
}
