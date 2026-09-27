import { createClient } from "./supabase/server";

/** 현재 로그인한 사용자와 관리자 여부 */
export async function getViewer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null, isAdmin: false };
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, is_admin")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, user, profile, isAdmin: !!profile?.is_admin };
}
