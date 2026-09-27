import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/env";

/**
 * 서버 전용 관리자 클라이언트 (보안 규칙을 건너뜀).
 * 구독자 이메일처럼 브라우저에 절대 노출되면 안 되는 데이터에만 써요.
 */
export function createAdminClient() {
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"]?.trim();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY 환경 변수가 없어요.");
  return createClient(supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
