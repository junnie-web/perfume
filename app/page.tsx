import Link from "next/link";
import { getViewer } from "@/lib/auth";
import Shelf from "@/components/Shelf";
import type { Perfume } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { supabase, user, isAdmin } = await getViewer();
  const [{ data: perfumes }, { data: reviews }, { data: reqs }] = await Promise.all([
    supabase.from("perfumes").select("*").order("brand").order("name"),
    supabase.from("curator_reviews").select("perfume_id, rating"),
    supabase.from("request_board").select("id, brand, name, votes").eq("status", "pending"),
  ]);
  let wished: string[] = [], owned: string[] = [];
  if (user) {
    const [w, c] = await Promise.all([
      supabase.from("wishlist").select("perfume_id"),
      supabase.from("collection").select("perfume_id"),
    ]);
    wished = (w.data ?? []).map((r) => r.perfume_id);
    owned = (c.data ?? []).map((r) => r.perfume_id);
  }
  const ratings = Object.fromEntries((reviews ?? []).map((r) => [r.perfume_id, r.rating]));
  const pendingCount = reqs?.length ?? 0;
  return (
    <>
      {isAdmin && (
        <div className="ownerbar">
          <Link className="btn" href="/admin#perfume">+ 새 향수 등록</Link>
          {pendingCount > 0 && <Link className="btn ghost" href="/requests">추가 요청 <b className="hotn">{pendingCount}</b>건 대기 중 →</Link>}
        </div>
      )}
      <Shelf
        perfumes={(perfumes ?? []) as Perfume[]}
        ratings={ratings}
        wished={wished}
        owned={owned}
        loggedIn={!!user}
        pendingRequests={(reqs ?? []) as any}
      />
    </>
  );
}
