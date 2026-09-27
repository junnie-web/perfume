"use client";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { voteRequest, setRequestStatus } from "@/app/actions";

export default function RequestActions({ id, brand, name, status, perfumeId, mine, loggedIn, isAdmin }: {
  id: string; brand: string; name: string; status: string; perfumeId: string | null; mine: boolean; loggedIn: boolean; isAdmin: boolean;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });
  if (status === "added" && perfumeId) return <Link className="btn" href={`/perfumes/${perfumeId}`}>보러 가기</Link>;
  return (
    <>
      {status === "pending" && (
        mine ? (
          <button className="btn on" disabled={pending} onClick={() => run(() => voteRequest(id, false))}>요청함 ✓</button>
        ) : (
          <button className="btn" disabled={pending} onClick={() => (loggedIn ? run(() => voteRequest(id, true)) : router.push("/login"))}>나도 요청</button>
        )
      )}
      {isAdmin && status === "pending" && (
        <>
          <Link className="btn primary" href={`/admin?req=${id}&brand=${encodeURIComponent(brand)}&name=${encodeURIComponent(name)}#perfume`}>등록하기</Link>
          <button className="btn ghost" disabled={pending} onClick={() => run(() => setRequestStatus(id, "rejected"))}>보류</button>
        </>
      )}
      {isAdmin && status === "rejected" && (
        <button className="btn ghost" disabled={pending} onClick={() => run(() => setRequestStatus(id, "pending"))}>다시 열기</button>
      )}
    </>
  );
}
