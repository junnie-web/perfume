"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateDisplayName } from "@/app/actions";

export default function NameForm({ current }: { current: string }) {
  const [name, setName] = useState(current);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form className="formgrid" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await updateDisplayName(name); setMsg(r.message ?? ""); router.refresh(); }); }}>
      <label className="f">닉네임 (인용 리뷰에 표시돼요)<input type="text" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} /></label>
      <button className="btn primary" disabled={pending}>저장</button>
      {msg && <p role="status" style={{ margin: 0, fontSize: 13 }}>{msg}</p>}
    </form>
  );
}
