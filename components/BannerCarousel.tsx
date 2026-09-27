"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Slide } from "@/lib/types";

/** 새소식 배너: 5초마다 다음 장으로 넘어가고, 화살표·점·손가락으로 넘길 수 있어요. */
export default function BannerCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);
  const n = slides.length;
  const go = useCallback((k: number) => setI(((k % n) + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(t);
  }, [n, paused]);

  if (!n) return null;
  return (
    <div
      className="carousel"
      aria-roledescription="carousel"
      aria-label="새소식"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onPointerDown={(e) => { startX.current = e.clientX; }}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, k) => (
          <Link
            key={s.id}
            href={s.href}
            className="slide"
            aria-roledescription="slide"
            aria-label={`${k + 1} / ${n}: ${s.title}`}
            aria-hidden={k !== i}
            tabIndex={k === i ? 0 : -1}
            draggable={false}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image} alt="" draggable={false} loading={k === 0 ? "eager" : "lazy"} />
            <div className="slide-text">
              <span className="slide-eyebrow">{s.eyebrow}</span>
              <h3>{s.title}</h3>
              {s.text && <p>{s.text}</p>}
              <span className="slide-more">자세히 보기 →</span>
            </div>
          </Link>
        ))}
      </div>
      {n > 1 && (
        <>
          <button className="car-btn prev" aria-label="이전 소식" onClick={() => go(i - 1)}>‹</button>
          <button className="car-btn next" aria-label="다음 소식" onClick={() => go(i + 1)}>›</button>
          <div className="dots" role="tablist" aria-label="소식 고르기">
            {slides.map((s, k) => (
              <button key={s.id} role="tab" aria-selected={k === i} aria-label={`${k + 1}번째 소식`} onClick={() => go(k)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
