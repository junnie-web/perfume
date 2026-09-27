"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function korean(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "이메일 또는 비밀번호가 맞지 않아요.";
  if (m.includes("already registered") || m.includes("already been registered")) return "이미 가입된 이메일이에요. 로그인 탭에서 로그인해 주세요.";
  if (m.includes("password should be")) return "비밀번호는 6자 이상이어야 해요.";
  if (m.includes("email not confirmed")) return "이메일 인증이 아직 안 된 계정이에요. 관리자에게 알려 주세요.";
  if (m.includes("rate limit")) return "잠시 요청이 많았어요. 1분 뒤 다시 시도해 주세요.";
  return msg;
}

export async function signIn(emailRaw: string, password: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, message: "이메일 주소를 확인해 주세요." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: korean(error.message) };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signUp(emailRaw: string, password: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, message: "이메일 주소를 확인해 주세요." };
  if (password.length < 6) return { ok: false, message: "비밀번호는 6자 이상이어야 해요." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, message: korean(error.message) };
  // 이미 가입된 주소면 Supabase가 빈 사용자 정보를 돌려줘요.
  if (data.user && (data.user.identities?.length ?? 0) === 0)
    return { ok: false, message: "이미 가입된 이메일이에요. 로그인 탭에서 로그인해 주세요." };
  if (!data.session)
    return { ok: false, message: "가입은 됐지만 이메일 인증이 켜져 있어서 바로 로그인이 안 돼요. 관리자에게 알려 주세요." };
  revalidatePath("/", "layout");
  return { ok: true };
}

/** 로그인한 사람이 비밀번호를 새로 정하거나 바꿔요. */
export async function setPassword(password: string) {
  if (password.length < 6) return { ok: false, message: "비밀번호는 6자 이상이어야 해요." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: korean(error.message) };
  return { ok: true, message: "비밀번호를 저장했어요." };
}
