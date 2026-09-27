"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/** 서버에서 로그인 링크 메일을 보내요. */
export async function sendLoginLink(emailRaw: string, nextRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, message: "이메일 주소를 확인해 주세요." };
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : (process.env["NEXT_PUBLIC_SITE_URL"] ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
