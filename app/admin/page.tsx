import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Newsletter } from "@/lib/types";
import { fmtDate, vol2 } from "@/lib/utils";
import AddPerfumeForm from "@/components/AddPerfumeForm";
import NewsletterComposer from "@/components/NewsletterComposer";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ req?: string; brand?: string; name?: string }> }) {
  const sp = await searchParams;
  const { supabase, user, isAdmin } = await getViewer();
  if (!user) redirect("/login?next=/admin");
  if (!isAdmin)
    return <div className="center-card"><h2>관리자 전용</h2><p className="muted" style={{ margin: 0 }}>관리자로 지정된 계정만 볼 수 있어요.</p></div>;

  const admin = createAdminClient();
  const [{ data: letters }, { data: subs }, { count: pending }] = await Promise.all([
    supabase.from("newsletters").select("*").order("vol", { ascending: false }),
    admin.from("subscribers").select("email, confirmed, created_at, unsubscribed_at").order("created_at", { ascending: false }),
    supabase.from("requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  const active = (subs ?? []).filter((s) => s.confirmed && !s.unsubscribed_at);
  const waiting = (subs ?? []).filter((s) => !s.confirmed && !s.unsubscribed_at);

  return (
    <>
      <div className="sec-h"><h2 style={{ fontFamily: "var(--serif)" }}>관리</h2>
        <Link className="btn ghost" href="/requests">추가 요청 {pending ?? 0}건 보기 →</Link>
      </div>

      <section className="adminsec" id="perfume">
        <h2>새 향수 등록</h2>
        <AddPerfumeForm prefill={{ brand: sp.brand, name: sp.name, req: sp.req }} />
      </section>

      <section className="adminsec" id="newsletter">
        <h2>새 뉴스레터</h2>
        <NewsletterComposer subCount={active.length} />
        <div className="tablewrap">
          <table className="simple">
            <thead><tr><th>호</th><th>제목</th><th>발행</th><th>메일 발송</th></tr></thead>
            <tbody>
              {((letters ?? []) as Newsletter[]).map((n) => (
                <tr key={n.id}>
                  <td className="mono">Vol. {vol2(n.vol)}</td>
                  <td><Link href={`/newsletter/${n.vol}`}>{n.title}</Link>{n.is_example && " (예시)"}</td>
                  <td className="mono">{fmtDate(n.published_at)}</td>
                  <td className="mono">{n.sent_at ? `${fmtDate(n.sent_at)} · ${n.sent_count}명` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>이미 발행한 호를 메일로 보내거나 테스트 발송하려면 해당 호를 열어 아래쪽 &lsquo;메일 발송&rsquo;을 쓰세요.</p>
      </section>

      <section className="adminsec" id="subscribers">
        <h2>구독자 <span className="mono muted" style={{ fontSize: 14 }}>확정 {active.length}명 · 확인 대기 {waiting.length}명</span></h2>
        <details className="sublist">
          <summary>목록 보기</summary>
          {active.length ? (
            <ul>{active.map((s) => <li key={s.email}><span>{s.email}</span><span className="mono muted">{fmtDate(s.created_at)}</span></li>)}</ul>
          ) : <p className="muted">아직 구독을 확정한 사람이 없어요.</p>}
        </details>
      </section>
    </>
  );
}
