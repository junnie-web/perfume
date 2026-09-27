"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addPerfume } from "@/app/actions";
import { CONCS, FAMILIES } from "@/lib/utils";

export default function AddPerfumeForm({ prefill }: { prefill: { brand?: string; name?: string; req?: string } }) {
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  return (
    <form
      ref={formRef}
      className="owner"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await addPerfume(fd);
          setMsg(r.message ?? "");
          if (r.ok && r.id) { formRef.current?.reset(); router.push(`/perfumes/${r.id}`); }
        });
      }}
    >
      {prefill.req && <p className="muted" style={{ margin: 0, fontSize: 13 }}>추가 요청에서 가져왔어요. 등록하면 요청이 &lsquo;등록 완료&rsquo;로 바뀌어요.</p>}
      <input type="hidden" name="request_id" value={prefill.req ?? ""} />
      <div className="two">
        <label className="f">브랜드 *<input type="text" name="brand" defaultValue={prefill.brand} placeholder="Le Labo" required /></label>
        <label className="f">이름 *<input type="text" name="name" defaultValue={prefill.name} placeholder="Santal 33" required /></label>
        <label className="f">한글 브랜드 (검색용)<input type="text" name="brand_ko" placeholder="르라보" /></label>
        <label className="f">한글 이름 (검색용)<input type="text" name="name_ko" placeholder="상탈 33" /></label>
        <label className="f">부향률<select name="conc">{CONCS.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="f">계열<select name="family">{Object.keys(FAMILIES).map((f) => <option key={f}>{f}</option>)}</select></label>
        <label className="f">출시 연도<input type="text" name="year" inputMode="numeric" placeholder="2026" /></label>
        <label className="f">분위기 (쉼표로 구분)<input type="text" name="mood" placeholder="중성적, 크리미" /></label>
      </div>
      <label className="f">탑 노트 (쉼표로 구분)<input type="text" name="top" placeholder="베르가못, 핑크페퍼" /></label>
      <label className="f">미들 노트<input type="text" name="heart" /></label>
      <label className="f">베이스 노트<input type="text" name="base" /></label>
      <label className="f">어울리는 계절<input type="text" name="seasons" placeholder="가을, 겨울" /></label>
      <div className="row-end"><button className="btn primary" disabled={pending}>{pending ? "등록 중…" : "등록"}</button></div>
      {msg && <p role="status" style={{ margin: 0, fontSize: 13 }}>{msg}</p>}
    </form>
  );
}
