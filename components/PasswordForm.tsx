"use client";
import { useState, useTransition } from "react";
import { setPassword } from "@/app/login/actions";

export default function PasswordForm() {
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  return (
    <form className="formgrid" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await setPassword(pw); setMsg(r.message ?? ""); if (r.ok) setPw(""); }); }}>
      <label className="f">새 비밀번호 (6자 이상)
        <input type="password" autoComplete="new-password" value={pw} minLength={6} onChange={(e) => setPw(e.target.value)} required />
      </label>
      <button className="btn" disabled={pending}>비밀번호 저장</button>
      {msg && <p role="status" style={{ margin: 0, fontSize: 13 }}>{msg}</p>}
    </form>
  );
}
