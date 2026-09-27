// 환경 변수를 "실행할 때" 읽어요.
// (NEXT_PUBLIC_ 값이 빌드 때 비어 있어도, 서버에서는 실제 값을 쓸 수 있게)
const env = process.env;

export function supabaseUrl(): string {
  return (env["SUPABASE_URL"] || env["NEXT_PUBLIC_SUPABASE_URL"] || "").trim().replace(/\/+$/, "");
}
export function supabaseAnonKey(): string {
  return (env["SUPABASE_ANON_KEY"] || env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || "").trim();
}
export function assertSupabaseEnv() {
  if (!supabaseUrl() || !supabaseAnonKey())
    throw new Error("Supabase 환경 변수(NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)가 없어요. Vercel 설정을 확인해 주세요.");
}
