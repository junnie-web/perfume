import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import CalendarView from "@/components/CalendarView";

export const dynamic = "force-dynamic";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const { supabase, user } = await getViewer();
  if (!user) redirect("/login?next=/calendar");
  // 서버는 UTC라서 한국 날짜 기준으로 이번 달을 계산해요.
  const kst = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 7);
  const month = m && /^\d{4}-\d{2}$/.test(m) ? m : kst;
  const [y, mo] = month.split("-").map(Number);
  const start = `${month}-01`;
  const end = `${month}-${String(new Date(y, mo, 0).getDate()).padStart(2, "0")}`;
  const [{ data: logs }, { data: memos }, { data: perfumes }, { data: col }] = await Promise.all([
    supabase.from("wear_logs").select("day, perfume_id").gte("day", start).lte("day", end),
    supabase.from("day_memos").select("day, memo").gte("day", start).lte("day", end),
    supabase.from("perfumes").select("id, brand, name, family").order("brand").order("name"),
    supabase.from("collection").select("perfume_id"),
  ]);
  return (
    <CalendarView
      month={month}
      logs={logs ?? []}
      memos={memos ?? []}
      perfumes={perfumes ?? []}
      ownedIds={(col ?? []).map((c) => c.perfume_id)}
    />
  );
}
