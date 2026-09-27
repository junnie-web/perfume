"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");
  const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!data?.is_admin) throw new Error("관리자만 할 수 있어요.");
  return supabase;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

/** 사진을 Supabase 보관함(site)에 올리고 공개 주소를 돌려줘요. */
async function uploadImage(file: File, folder: string) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("JPG, PNG, WEBP 사진만 올릴 수 있어요.");
  if (file.size > 5 * 1024 * 1024) throw new Error("사진은 5MB까지 올릴 수 있어요.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from("site").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`사진을 올리지 못했어요: ${error.message}`);
  return admin.storage.from("site").getPublicUrl(path).data.publicUrl;
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createBanner(form: FormData) {
  try {
    const supabase = await requireAdmin();
    const v = (k: string) => String(form.get(k) ?? "").trim();
    if (!v("title")) return { ok: false, message: "제목을 적어 주세요." };
    const file = form.get("image") as File | null;
    let image_url = v("image_url") || null;
    if (file && file.size > 0) image_url = await uploadImage(file, "banners");
    const { error } = await supabase.from("banners").insert({
      eyebrow: v("eyebrow") || null,
      title: v("title"),
      body: v("body") || null,
      link: v("link") || null,
      image_url,
      sort: parseInt(v("sort"), 10) || 0,
    });
    if (error) return { ok: false, message: error.message };
    refresh();
    return { ok: true, message: "배너를 올렸어요. 메인 화면 새소식에 보여요." };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "배너를 올리지 못했어요." };
  }
}

export async function toggleBanner(id: string, active: boolean) {
  const supabase = await requireAdmin();
  await supabase.from("banners").update({ active }).eq("id", id);
  refresh();
}

export async function deleteBanner(id: string) {
  const supabase = await requireAdmin();
  await supabase.from("banners").delete().eq("id", id);
  refresh();
}

export async function setHeroImage(form: FormData) {
  try {
    const supabase = await requireAdmin();
    const file = form.get("image") as File | null;
    if (!file || !file.size) return { ok: false, message: "사진을 골라 주세요." };
    const url = await uploadImage(file, "hero");
    const { error } = await supabase.from("site_settings").upsert({ key: "hero_image", value: url, updated_at: new Date().toISOString() });
    if (error) return { ok: false, message: error.message };
    refresh();
    return { ok: true, message: "메인 사진을 바꿨어요." };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "사진을 바꾸지 못했어요." };
  }
}

export async function resetHeroImage() {
  const supabase = await requireAdmin();
  await supabase.from("site_settings").delete().eq("key", "hero_image");
  refresh();
}
