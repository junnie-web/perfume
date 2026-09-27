import Link from "next/link";
import { getViewer } from "@/lib/auth";
import type { Newsletter } from "@/lib/types";
import { fmtDate, vol2 } from "@/lib/utils";
import SubscribeForm from "@/components/SubscribeForm";

export const dynamic = "force-dynamic";

export default async function NewsletterPage({ searchParams }: { searchParams: Promise<{ confirmed?: string }> }) {
  const { confirmed } = await searchParams;
  const { supabase, user, isAdmin } = await getViewer();
  const { data } = await supabase.from("newsletters").select("*").order("vol", { ascending: false });
  const list = (data ?? []) as Newsletter[];
  return (
    <>
      {confirmed === "1" && <div className="notice">구독이 완료됐어요. 다음 호부터 메일로 보내드릴게요.</div>}
      {confirmed === "0" && <div className="notice">확인 링크가 올바르지 않거나 만료됐어요. 다시 구독 신청해 주세요.</div>}
      {isAdmin && <div className="ownerbar"><Link className="btn primary" href="/admin#newsletter">+ 새 뉴스레터 쓰기</Link></div>}
      <SubscribeForm defaultEmail={user?.email ?? ""} />
      <div className="sec-h"><h2>Parfumoir Letter</h2><span className="mono muted">{list.length}호</span></div>
      {list.length ? (
        <div className="nl">
          {list.map((n) => (
            <Link key={n.id} className="issue" href={`/newsletter/${n.vol}`}>
              <span className="vol">Vol. {vol2(n.vol)}</span>
              <h3>{n.title}</h3>
              <p>{n.body.slice(0, 160)}</p>
              <span className="mono muted">{fmtDate(n.published_at)} {n.is_example && <span className="tag ex">예시</span>}</span>
            </Link>
          ))}
        </div>
      ) : <div className="empty">아직 발행된 뉴스레터가 없어요.</div>}
    </>
  );
}
