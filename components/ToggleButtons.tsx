"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlist, toggleCollection, addWear } from "@/app/actions";
import { HeartIcon, BottleIcon, SprayIcon } from "./Icons";

function localDay() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 카드 오른쪽 위 하트 */
export function HeartButton({ id, on, loggedIn }: { id: string; on: boolean; loggedIn: boolean }) {
  const [state, setState] = useState(on);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      className={`heart ${state ? "on" : ""}`}
      aria-pressed={state}
      aria-label={state ? "위시리스트에서 빼기" : "위시리스트에 담기"}
      disabled={pending}
      onClick={() => {
        if (!loggedIn) return router.push("/login");
        const next = !state;
        setState(next);
        start(async () => {
          const r = await toggleWishlist(id, next);
          if (!r.ok) setState(!next);
        });
      }}
    >
      <HeartIcon filled={state} />
    </button>
  );
}

type Kind = "wish" | "own";
export function ToggleButton({
  id, kind, on, loggedIn, onLabel, offLabel, className,
}: { id: string; kind: Kind; on: boolean; loggedIn: boolean; onLabel: string; offLabel: string; className?: string }) {
  const [state, setState] = useState(on);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      className={`btn ${state ? "on" : ""} ${className ?? ""}`}
      disabled={pending}
      onClick={() => {
        if (!loggedIn) return router.push("/login");
        const next = !state;
        setState(next);
        start(async () => {
          const r = kind === "wish" ? await toggleWishlist(id, next) : await toggleCollection(id, next);
          if (!r.ok) setState(!next);
          router.refresh();
        });
      }}
    >
      {kind === "wish" ? <HeartIcon filled={state} /> : <BottleIcon />} {state ? onLabel : offLabel}
    </button>
  );
}

export function WearTodayButton({ id, loggedIn, wornDays }: { id: string; loggedIn: boolean; wornDays: string[] }) {
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const [today, setToday] = useState("");
  useEffect(() => setToday(localDay()), []);
  const already = done || (today !== "" && wornDays.includes(today));
  return (
    <button
      className={`btn ${already ? "on" : ""}`}
      disabled={pending || already}
      onClick={() => {
        if (!loggedIn) return router.push("/login");
        start(async () => {
          const r = await addWear(localDay(), id);
          if (r.ok) setDone(true);
        });
      }}
    >
      <SprayIcon /> {already ? "오늘 기록됨" : "오늘 뿌렸어요"}
    </button>
  );
}
