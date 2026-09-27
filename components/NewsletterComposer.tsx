"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishNewsletter } from "@/app/actions";

export default function NewsletterComposer({ subCount }: { subCount: number }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mail, setMail] = useState(subCount > 0);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      className="owner"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await publishNewsletter(title, body, mail);
          setMsg(r.message ?? "");
          if (r.id) { setTitle(""); setBody(""); router.refresh(); }
        });
      }}
    >
      <label className="f">제목<input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="이번 호의 제목" required /></label>
      <label className="f">본문 (빈 줄로 문단 구분)<textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} required /></label>
      <label className="check"><input type="checkbox" checked={mail} onChange={(e) => setMail(e.target.checked)} /> 발행하면서 구독자 {subCount}명에게 메일로도 보내기</label>
      <div className="row-end"><button className="btn primary" disabled={pending}>{pending ? "발행 중…" : "발행"}</button></div>
      {msg && <p className="sendmsg" role="status">{msg}</p>}
    </form>
  );
}
