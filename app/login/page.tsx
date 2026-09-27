"use client";
import { useState } from "react";
import { sendLoginLink } from "./actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");
  return (
    <div className="center-card">
      <h2>로그인</h2>
      <p className="muted" style={{ margin: 0 }}>
        이메일을 적으면 로그인 링크를 보내드려요. 비밀번호는 필요 없고, 처음이면 자동으로 가입돼요.
      </p>
      {state === "sent" ? (
        <div className="notice"><b>{email}</b>로 로그인 링크를 보냈어요. 메일함에서 링크를 누르면 로그인돼요. (스팸함도 확인해 주세요)</div>
      ) : (
        <form
          className="formgrid"
          onSubmit={async (e) => {
            e.preventDefault();
            setState("sending");
            const next = new URLSearchParams(window.location.search).get("next") ?? "/";
            const r = await sendLoginLink(email, next);
            if (r.ok) setState("sent");
            else { setErr(r.message ?? ""); setState("error"); }
          }}
        >
          <label className="f">이메일<input type="text" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
          <button className="btn primary" disabled={state === "sending"}>{state === "sending" ? "보내는 중…" : "로그인 링크 받기"}</button>
          {state === "error" && <p role="alert" style={{ margin: 0, fontSize: 13 }}>링크를 보내지 못했어요: {err}</p>}
        </form>
      )}
    </div>
  );
}
