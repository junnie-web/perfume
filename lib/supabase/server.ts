import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { assertSupabaseEnv, supabaseAnonKey, supabaseUrl } from "@/lib/env";

/** 서버 컴포넌트·서버 액션용. 로그인한 사용자의 권한으로 동작해요 (보안 규칙 적용). */
export async function createClient() {
  assertSupabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없어요. 미들웨어가 세션을 갱신해 줘요.
        }
      },
    },
  });
}
