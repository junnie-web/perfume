import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

// 설정 점검용: 열쇠 값은 절대 보여주지 않고, 있는지/형식이 맞는지만 알려줘요.
export async function GET() {
  const env = process.env;
  const has = (k: string) => {
    const v = env[k];
    if (!v) return "없음";
    if (v !== v.trim()) return "있음 (앞뒤에 공백·줄바꿈이 섞여 있어요!)";
    return `있음 (${v.length}자)`;
  };
  const report: Record<string, unknown> = {
    NEXT_PUBLIC_SUPABASE_URL: has("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: has("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY: has("SUPABASE_SERVICE_ROLE_KEY"),
    RESEND_API_KEY: has("RESEND_API_KEY"),
    NEWSLETTER_FROM: has("NEWSLETTER_FROM"),
    NEXT_PUBLIC_SITE_URL: env["NEXT_PUBLIC_SITE_URL"] ?? "없음",
    ANTHROPIC_API_KEY: has("ANTHROPIC_API_KEY"),
    supabase_url_value: supabaseUrl() || "없음",
    // 이름에 보이지 않는 글자가 섞였는지 확인용 (값은 안 보여줘요)
    similar_names: Object.keys(env).filter((k) => /SUPABASE|RESEND|NEWSLETTER|ANTHROPIC|SITE_URL/i.test(k)).map((k) => JSON.stringify(k)),
  };
  try {
    const sb = createClient(supabaseUrl().trim(), supabaseAnonKey().trim());
    const { count, error } = await sb.from("perfumes").select("id", { count: "exact", head: true });
    report.database = error ? `연결 실패: ${error.message}` : `연결 성공 (향수 ${count}개)`;
  } catch (e: any) {
    report.database = `연결 실패: ${e?.message ?? e}`;
  }
  return NextResponse.json(report, { headers: { "cache-control": "no-store", "content-type": "application/json; charset=utf-8" } });
}
