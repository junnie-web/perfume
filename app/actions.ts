"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requestSlug, slugify, splitList, norm } from "@/lib/utils";
import { sendConfirmEmail, sendNewsletterEmails } from "@/lib/mail";

export type ActionResult = { ok: boolean; message?: string; id?: string };

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!data?.is_admin) throw new Error("관리자만 할 수 있어요.");
  return { supabase, user };
}

/* ---------- 위시리스트 · 컬렉션 · 캘린더 ---------- */

export async function toggleWishlist(perfumeId: string, on: boolean): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const q = on
    ? supabase.from("wishlist").upsert({ user_id: user.id, perfume_id: perfumeId })
    : supabase.from("wishlist").delete().eq("user_id", user.id).eq("perfume_id", perfumeId);
  const { error } = await q;
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleCollection(perfumeId: string, on: boolean): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (on) {
    const { error } = await supabase.from("collection").upsert({ user_id: user.id, perfume_id: perfumeId });
    if (error) return { ok: false, message: error.message };
    // 산 향수는 위시리스트에서 자동으로 빼요.
    await supabase.from("wishlist").delete().eq("user_id", user.id).eq("perfume_id", perfumeId);
  } else {
    const { error } = await supabase.from("collection").delete().eq("user_id", user.id).eq("perfume_id", perfumeId);
    if (error) return { ok: false, message: error.message };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveCollectionMemo(perfumeId: string, memo: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("collection")
    .update({ memo: memo.slice(0, 300) || null })
    .eq("user_id", user.id)
    .eq("perfume_id", perfumeId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/collection");
  return { ok: true };
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function addWear(day: string, perfumeId: string): Promise<ActionResult> {
  if (!DAY_RE.test(day)) return { ok: false, message: "날짜 형식이 올바르지 않아요." };
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("wear_logs").upsert({ user_id: user.id, day, perfume_id: perfumeId });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeWear(day: string, perfumeId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("wear_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("day", day)
    .eq("perfume_id", perfumeId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/calendar");
  return { ok: true };
}

export async function saveDayMemo(day: string, memo: string): Promise<ActionResult> {
  if (!DAY_RE.test(day)) return { ok: false, message: "날짜 형식이 올바르지 않아요." };
  const { supabase, user } = await requireUser();
  const text = memo.trim().slice(0, 500);
  const { error } = text
    ? await supabase.from("day_memos").upsert({ user_id: user.id, day, memo: text })
    : await supabase.from("day_memos").delete().eq("user_id", user.id).eq("day", day);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/calendar");
  return { ok: true };
}

/* ---------- 인용 리뷰 ---------- */

export async function postQuote(perfumeId: string, body: string, rating: number | null): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const text = body.trim();
  if (!text) return { ok: false, message: "내용을 적어 주세요." };
  if (text.length > 500) return { ok: false, message: "500자까지 쓸 수 있어요." };
  const { error } = await supabase.from("quotes").insert({
    perfume_id: perfumeId,
    author_id: user.id,
    body: text,
    rating: rating && rating >= 1 && rating <= 5 ? rating : null,
  });
  if (error) return { ok: false, message: error.message };
  revalidatePath(`/perfumes/${perfumeId}`);
  return { ok: true };
}

export async function deleteQuote(quoteId: string, perfumeId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("quotes").delete().eq("id", quoteId);
  if (error) return { ok: false, message: error.message };
  revalidatePath(`/perfumes/${perfumeId}`);
  return { ok: true };
}

/* ---------- 신향 요청 ---------- */

export async function createRequest(brand: string, name: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  brand = brand.trim().slice(0, 80);
  name = name.trim().slice(0, 120);
  if (!brand || !name) return { ok: false, message: "브랜드와 향수 이름을 모두 적어 주세요." };

  // 이미 등록된 향수인지 확인
  const { data: existing } = await supabase.from("perfumes").select("id, brand, name");
  const hit = (existing ?? []).find((p) => norm(p.brand) === norm(brand) && norm(p.name) === norm(name));
  if (hit) return { ok: false, message: "이미 Parfumoir에 있는 향수예요.", id: hit.id };

  const slug = requestSlug(brand, name);
  let { data: req } = await supabase.from("requests").select("id, status").eq("slug", slug).maybeSingle();
  if (!req) {
    const { data, error } = await supabase
      .from("requests")
      .insert({ slug, brand, name, created_by: user.id })
      .select("id, status")
      .single();
    if (error) {
      // 동시에 같은 요청이 만들어진 경우
      const again = await supabase.from("requests").select("id, status").eq("slug", slug).maybeSingle();
      if (!again.data) return { ok: false, message: error.message };
      req = again.data;
    } else req = data;
  }
  if (req.status !== "pending") return { ok: false, message: "이미 처리된 요청이에요." };
  await supabase.from("request_votes").upsert({ request_id: req.id, user_id: user.id }, { ignoreDuplicates: true });
  revalidatePath("/", "layout");
  return { ok: true, message: "요청을 올렸어요." };
}

export async function voteRequest(requestId: string, on: boolean): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = on
    ? await supabase.from("request_votes").upsert({ request_id: requestId, user_id: user.id }, { ignoreDuplicates: true })
    : await supabase.from("request_votes").delete().eq("request_id", requestId).eq("user_id", user.id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/requests");
  return { ok: true };
}

export async function setRequestStatus(requestId: string, status: "pending" | "rejected"): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("requests").update({ status }).eq("id", requestId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ---------- 관리자: 향수 · 리뷰 ---------- */

export async function addPerfume(form: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const v = (k: string) => String(form.get(k) ?? "").trim();
  const brand = v("brand"), name = v("name");
  if (!brand || !name) return { ok: false, message: "브랜드와 이름을 적어 주세요." };
  const id = slugify(`${brand}-${name}`);
  const year = parseInt(v("year"), 10);
  const { error } = await supabase.from("perfumes").insert({
    id,
    brand,
    brand_ko: v("brand_ko") || null,
    name,
    name_ko: v("name_ko") || null,
    conc: v("conc") || "EDP",
    family: v("family") || "우디",
    year: Number.isFinite(year) ? year : null,
    top: splitList(v("top")),
    heart: splitList(v("heart")),
    base: splitList(v("base")),
    seasons: splitList(v("seasons")),
    mood: splitList(v("mood")),
  });
  if (error) return { ok: false, message: error.code === "23505" ? "이미 등록된 향수예요." : error.message };

  const reqId = v("request_id");
  if (reqId) await supabase.from("requests").update({ status: "added", perfume_id: id }).eq("id", reqId);

  revalidatePath("/", "layout");
  return { ok: true, id, message: "새 향수를 등록했어요." };
}

export async function saveReview(
  perfumeId: string,
  review: { rating: number; longevity: number; sillage: number; body: string }
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const clamp = (n: number) => Math.min(5, Math.max(1, Math.round(n || 3)));
  if (!review.body.trim()) return { ok: false, message: "리뷰 내용을 적어 주세요." };
  const { error } = await supabase.from("curator_reviews").upsert({
    perfume_id: perfumeId,
    rating: clamp(review.rating),
    longevity: clamp(review.longevity),
    sillage: clamp(review.sillage),
    body: review.body.trim(),
    is_example: false,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true, message: "리뷰를 게시했어요." };
}

/* ---------- 뉴스레터 ---------- */

export async function publishNewsletter(title: string, body: string, sendMail: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  title = title.trim();
  body = body.trim();
  if (!title || !body) return { ok: false, message: "제목과 본문을 모두 적어 주세요." };
  const { data: last } = await supabase
    .from("newsletters")
    .select("vol")
    .order("vol", { ascending: false })
    .limit(1)
    .maybeSingle();
  const vol = (last?.vol ?? 0) + 1;
  const { data, error } = await supabase
    .from("newsletters")
    .insert({ vol, title, body })
    .select("id")
    .single();
  if (error) return { ok: false, message: error.message };
  revalidatePath("/newsletter");
  if (sendMail) {
    const res = await sendNewsletter(data.id, false);
    return { ok: res.ok, id: data.id, message: `Vol. ${vol}을 발행했어요. ${res.message ?? ""}` };
  }
  return { ok: true, id: data.id, message: `Vol. ${vol}을 발행했어요.` };
}

export async function deleteNewsletter(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("newsletters").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/newsletter");
  return { ok: true };
}

/** test=true 면 관리자 본인 메일로만 보내요. */
export async function sendNewsletter(id: string, test: boolean): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  const { data: n } = await supabase.from("newsletters").select("*").eq("id", id).single();
  if (!n) return { ok: false, message: "뉴스레터를 찾을 수 없어요." };
  try {
    if (test) {
      if (!user.email) return { ok: false, message: "내 이메일 주소를 알 수 없어요." };
      await sendNewsletterEmails(n, [{ email: user.email, token: "test" }]);
      return { ok: true, message: `${user.email}로 테스트 메일을 보냈어요.` };
    }
    const admin = createAdminClient();
    const { data: subs, error } = await admin
      .from("subscribers")
      .select("email, token")
      .eq("confirmed", true)
      .is("unsubscribed_at", null);
    if (error) return { ok: false, message: error.message };
    if (!subs?.length) return { ok: false, message: "아직 구독 확인을 마친 구독자가 없어요." };
    const sent = await sendNewsletterEmails(n, subs);
    await admin.from("newsletters").update({ sent_at: new Date().toISOString(), sent_count: sent }).eq("id", id);
    revalidatePath("/newsletter");
    revalidatePath("/admin");
    return { ok: true, message: `구독자 ${sent}명에게 보냈어요.` };
  } catch (e: any) {
    return { ok: false, message: `메일을 보내지 못했어요: ${e?.message ?? e}` };
  }
}

/** 누구나(로그인 없이도) 구독 신청. 확인 메일의 링크를 눌러야 구독이 확정돼요. */
export async function subscribe(emailRaw: string): Promise<ActionResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200)
    return { ok: false, message: "이메일 주소를 확인해 주세요." };
  const admin = createAdminClient();
  const { data: existing } = await admin.from("subscribers").select("*").eq("email", email).maybeSingle();
  if (existing?.confirmed && !existing.unsubscribed_at)
    return { ok: true, message: "이미 구독 중인 주소예요." };
  let token = existing?.token as string | undefined;
  if (!existing) {
    const { data, error } = await admin.from("subscribers").insert({ email }).select("token").single();
    if (error) return { ok: false, message: "구독 신청에 실패했어요. 잠시 뒤 다시 시도해 주세요." };
    token = data.token;
  } else {
    await admin.from("subscribers").update({ unsubscribed_at: null, confirmed: false }).eq("id", existing.id);
  }
  try {
    await sendConfirmEmail(email, token!);
  } catch {
    return { ok: false, message: "확인 메일을 보내지 못했어요. 잠시 뒤 다시 시도해 주세요." };
  }
  return { ok: true, message: `${email}로 확인 메일을 보냈어요. 메일의 버튼을 누르면 구독이 완료돼요.` };
}

/* ---------- 내 정보 ---------- */

export async function updateDisplayName(name: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const v = name.trim().slice(0, 30);
  if (!v) return { ok: false, message: "닉네임을 적어 주세요." };
  const { error } = await supabase.from("profiles").update({ display_name: v }).eq("id", user.id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true, message: "닉네임을 바꿨어요." };
}
