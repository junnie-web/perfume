"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRequest } from "@/app/actions";

export default function RequestForm({
  initialName = "", loggedIn, compact,
}: { initialName?: string; loggedIn: boolean; compact?: boolean }) {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState(initialName);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!loggedIn)
    return (
      <p className="muted" style={{ fontSize: 13, margin: 0 }}>
        <a href="/login">로그인</a>하면 추가 요청을 올릴 수 있어요.
      </p>
    );
  return (
    <form
      className="formgrid"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await createRequest(brand, name);
          if (!r.ok && r.id) return router.push(`/perfumes/${r.id}`);
          setMsg(r.message ?? "");
          if (r.ok) { setBrand(""); setName(""); router.push("/requests"); router.refresh(); }
        });
      }}
    >
      <div className={compact ? "two" : "formgrid"}>
        <label className="f">브랜드<input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="예: Frederic Malle" required /></label>
        <label className="f">향수 이름<input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: Portrait of a Lady" required /></label>
      </div>
      <div className="row-end"><button className="btn primary" disabled={pending}>{pending ? "올리는 중…" : "추가 요청하기"}</button></div>
      {msg && <p className="muted" role="status" style={{ margin: 0, fontSize: 13 }}>{msg}</p>}
    </form>
  );
}
