import type { Perfume } from "./types";

export const FAMILIES: Record<string, string> = {
  우디: "#8A5A3B",
  플로럴: "#C2527A",
  머스크: "#8C86A8",
  그린: "#4E8A4A",
  시트러스: "#D19A1E",
  앰버: "#B8662A",
  아로마틱: "#3F8A8A",
};
export const CONCS = ["EDP", "EDT", "Parfum", "Cologne"];
export const NEW_DAYS = 30;

export const famColor = (f: string) => FAMILIES[f] ?? "#888888";
export const stars = (n: number | null | undefined) => "★".repeat(n ?? 0) + "☆".repeat(5 - (n ?? 0));
export const notesOf = (p: Pick<Perfume, "top" | "heart" | "base">) => [...(p.top ?? []), ...(p.heart ?? []), ...(p.base ?? [])];
export const isNew = (p: Pick<Perfume, "created_at">) =>
  Date.now() - new Date(p.created_at).getTime() < NEW_DAYS * 864e5;

/** 검색용 정규화: 소문자, 공백·기호 제거 */
export const norm = (s: string | null | undefined) =>
  String(s ?? "").toLowerCase().replace(/[\s·&'’.\-_]/g, "");

/** 영문·숫자·하이픈만 남긴 id (한글은 코드값으로 바꿔요) */
export function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, (m) => m.charCodeAt(0).toString(36))
      .replace(/-+/g, "-")
      .slice(0, 120) || `p${Date.now()}`
  );
}
export const requestSlug = (brand: string, name: string) => slugify(`${norm(brand)}--${norm(name)}`);

export function fmtDate(v: string | number | Date | null | undefined) {
  if (!v) return "";
  const d = new Date(v);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
export function ago(v: string) {
  const s = (Date.now() - new Date(v).getTime()) / 1000;
  if (s < 60) return "방금";
  if (s < 3600) return `${Math.floor(s / 60)}분 전`;
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}일 전`;
  return fmtDate(v);
}
export const splitList = (s: string) =>
  s.split(/[,，]/).map((x) => x.trim()).filter(Boolean);
export const vol2 = (n: number) => String(n).padStart(2, "0");

/** 기본 감성 사진 (Unsplash 무료 사진). 관리 화면에서 내 사진으로 바꿀 수 있어요. */
const U = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
export const DEFAULT_HERO = U("1595425959632-34f2822322ce", 2000);
export const FALLBACK_PHOTOS = [
  U("1588405748880-12d1d2a59f75"),
  U("1594125311687-3b1b3eafa9f4"),
  U("1543422655-ac1c6ca993ed"),
  U("1615160460366-2c9a41771b51"),
  U("1458538977777-0549b2370168"),
];
