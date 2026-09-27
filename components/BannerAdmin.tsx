"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBanner, deleteBanner, resetHeroImage, setHeroImage, toggleBanner } from "@/app/admin/actions";
import type { Banner } from "@/lib/types";

export function HeroForm({ current, isDefault }: { current: string; isDefault: boolean }) {
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} className="owner" onSubmit={(e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      start(async () => { const r = await setHeroImage(fd); setMsg(r.message ?? ""); if (r.ok) { ref.current?.reset(); router.refresh(); } });
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={current} alt="현재 메인 사진" className="admin-thumb wide" />
      <p className="muted" style={{ margin: 0, fontSize: 13 }}>{isDefault ? "지금은 기본 사진이에요." : "직접 올린 사진이에요."} 가로로 긴 사진이 잘 어울려요. (5MB까지)</p>
      <label className="f">새 메인 사진<input type="file" name="image" accept="image/*" required /></label>
      <div className="row-end">
        {!isDefault && <button type="button" className="btn ghost" disabled={pending} onClick={() => start(async () => { await resetHeroImage(); router.refresh(); })}>기본 사진으로</button>}
        <button className="btn primary" disabled={pending}>{pending ? "올리는 중…" : "메인 사진 바꾸기"}</button>
      </div>
      {msg && <p role="status" style={{ margin: 0, fontSize: 13 }}>{msg}</p>}
    </form>
  );
}

export function BannerForm() {
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} className="owner" onSubmit={(e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      start(async () => { const r = await createBanner(fd); setMsg(r.message ?? ""); if (r.ok) { ref.current?.reset(); router.refresh(); } });
    }}>
      <div className="two">
        <label className="f">작은 윗글<input type="text" name="eyebrow" placeholder="예: 이벤트, 공지, 이달의 향" /></label>
        <label className="f">순서 (작을수록 먼저)<input type="text" name="sort" inputMode="numeric" placeholder="0" /></label>
      </div>
      <label className="f">제목 *<input type="text" name="title" placeholder="예: 10월, 가을 우디 특집" required /></label>
      <label className="f">한 줄 설명<input type="text" name="body" placeholder="예: 이번 달 큐레이터가 고른 우디 향 5가지" /></label>
      <label className="f">누르면 갈 곳<input type="text" name="link" placeholder="예: /newsletter/3 또는 /perfumes/aesop-hwyl" /></label>
      <label className="f">사진 (없으면 기본 감성 사진이 들어가요)<input type="file" name="image" accept="image/*" /></label>
      <div className="row-end"><button className="btn primary" disabled={pending}>{pending ? "올리는 중…" : "배너 올리기"}</button></div>
      {msg && <p role="status" style={{ margin: 0, fontSize: 13 }}>{msg}</p>}
    </form>
  );
}

export function BannerList({ banners }: { banners: Banner[] }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState("");
  const router = useRouter();
  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); setConfirm(""); router.refresh(); });
  if (!banners.length) return <p className="muted" style={{ margin: 0, fontSize: 13 }}>직접 올린 배너가 아직 없어요. 신향·뉴스레터·요청 1위 소식은 자동으로 슬라이드에 나와요.</p>;
  return (
    <div className="list">
      {banners.map((b) => (
        <div key={b.id} className="li" style={{ gridTemplateColumns: "auto 1fr auto" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {b.image_url ? <img src={b.image_url} alt="" className="admin-thumb" /> : <span className="admin-thumb empty-thumb">사진 없음</span>}
          <div>
            <b style={{ fontFamily: "var(--serif)" }}>{b.title}</b>
            <div className="muted" style={{ fontSize: 12 }}>{b.eyebrow ?? ""} {b.link ? `→ ${b.link}` : ""} {b.active ? "" : "· 숨김"}</div>
          </div>
          <span style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button className="btn ghost" disabled={pending} onClick={() => run(() => toggleBanner(b.id, !b.active))}>{b.active ? "숨기기" : "보이기"}</button>
            {confirm === b.id ? (
              <button className="btn" disabled={pending} onClick={() => run(() => deleteBanner(b.id))}>정말 삭제</button>
            ) : (
              <button className="btn ghost" onClick={() => setConfirm(b.id)}>삭제</button>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
