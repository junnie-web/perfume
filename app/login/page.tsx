"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "./actions";

export default function LoginPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit() {
    setErr("");
    if (mode === "up" && pw !== pw2) return setErr("비밀번호 두 칸이 서로 달라요.");
    start(async () => {
      const r = mode === "in" ? await signIn(email, pw) : await signUp(email, pw);
      if (!r.ok) return setErr(r.message ?? "");
      const next = new URLSearchParams(window.location.search).get("next") ?? "/";
      router.push(next.startsWith("/") && !next.startsWith("//") ? next : "/");
      router.refresh();
    });
  }

  return (
    <div className="center-card">
      <div className="seg" role="tablist" aria-label="로그인 또는 회원가입" style={{ justifySelf: "start" }}>
        <button role="tab" aria-pressed={mode === "in"} onClick={() => { setMode("in"); setErr(""); }}>로그인</button>
        <button role="tab" aria-pressed={mode === "up"} onClick={() => { setMode("up"); setErr(""); }}>회원가입</button>
      </div>
      <h2>{mode === "in" ? "로그인" : "회원가입"}</h2>
      {mode === "up" && <p className="muted" style={{ margin: 0 }}>이메일과 비밀번호만 있으면 바로 가입돼요.</p>}
      <form className="formgrid" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <label className="f">이메일
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </label>
        <label className="f">비밀번호 {mode === "up" && "(6자 이상)"}
          <input type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} value={pw} onChange={(e) => setPw(e.target.value)} required minLength={6} />
        </label>
        {mode === "up" && (
          <label className="f">비밀번호 확인
            <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} required minLength={6} />
          </label>
        )}
        <button className="btn primary" disabled={pending}>{pending ? "잠시만요…" : mode === "in" ? "로그인" : "가입하기"}</button>
        {err && <p role="alert" style={{ margin: 0, fontSize: 13 }}>{err}</p>}
      </form>
    </div>
  );
}
