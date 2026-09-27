import Link from "next/link";
import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth";
import type { Newsletter } from "@/lib/types";
import { fmtDate, vol2 } from "@/lib/utils";
import SubscribeForm from "@/components/SubscribeForm";
import NewsletterSendPanel from "@/components/NewsletterSendPanel";

export const dynamic = "force-dynamic";

export default async function IssuePage({ params }: { params: Promise<{ vol: string }> }) {
  const { vol } = await params;
  const v = parseInt(vol, 10);
  if (!Number.isFinite(v)) notFound();
  const { supabase, user, isAdmin } = await getViewer();
  const { data } = await supabase.from("newsletters").select("*").eq("vol", v).maybeSingle();
  if (!data) notFound();
  const n = data as Newsletter;
  let subCount = 0;
  if (isAdmin) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const { count } = await createAdminClient()
      .from("subscribers").select("id", { count: "exact", head: true })
      .eq("confirmed", true).is("unsubscribed_at", null);
    subCount = count ?? 0;
  }
  return (
    <>
      <Link className="btn ghost back" href="/newsletter">← 뉴스레터 목록</Link>
      <article className="reader">
        <div className="vol">Vol. {vol2(n.vol)}</div>
        <h2>{n.title}</h2>
        <div className="mono muted" style={{ marginBottom: 24 }}>{fmtDate(n.published_at)} {n.is_example && <span className="tag ex">예시</span>}</div>
        <div className="prose">{n.body.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>
        {isAdmin ? (
          <NewsletterSendPanel id={n.id} vol={n.vol} sentAt={n.sent_at} sentCount={n.sent_count} subCount={subCount} />
        ) : (
          <div style={{ marginTop: 28 }}><SubscribeForm defaultEmail={user?.email ?? ""} /></div>
        )}
      </article>
    </>
  );
}
