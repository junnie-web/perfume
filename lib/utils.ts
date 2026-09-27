import type { Perfume } from "./types";

/** 향 계열 표시색: 민트 한 가지 색의 진하기로만 구분 (진한 → 옅은) */
export const FAMILIES: Record<string, string> = {
  우디: "#2B5451",
  앰버: "#3B6F6B",
  아로마틱: "#4F8783",
  그린: "#679F9A",
  머스크: "#84B5B0",
  시트러스: "#A3C9C5",
  플로럴: "#C2DCD9",
};
export const CONCS = ["EDP", "EDT", "Parfum", "Cologne"];
export const NEW_DAYS = 30;

export const famColor = (f: string) => FAMILIES[f] ?? "#84B5B0";
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

/**
 * 기본 사진 (Unsplash 일반 라이선스: 상업적 이용 무료, 출처 표기 의무 없음).
 * 브랜드가 드러나지 않는 차분한 유리병·말린 식물·그림자 사진만 골랐어요.
 * 관리 화면에서 직접 찍은 사진으로 바꿀 수 있어요.
 */
const U = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
export const DEFAULT_HERO = U("1609064672730-1fc9ee166d2f", 2000); // 투명한 유리병에 꽂힌 마른 밀
export const FALLBACK_PHOTOS = [
  U("1608571424266-edeb9bbefdec"), // 흰 테이블 위 갈색 유리병
  U("1591704951890-0862b2e98acb"), // 흰 배경의 투명한 유리병
  U("1619422305894-dd096b3e6b98"), // 흰 배경의 흰 꽃
  U("1752520836249-2b8738e12664"), // 거친 벽에 드리운 그림자
  U("1609064672630-cd07b0c03909"), // 유리 화병의 마른 식물
  U("1563261883-25b59aad64d8"),     // 투명한 유리 화병
];

/** 라벨에 찍는 부향률 전체 이름 */
export const concFull = (c: string) =>
  ({ EDP: "Eau de Parfum", EDT: "Eau de Toilette", Parfum: "Parfum", Cologne: "Eau de Cologne" } as Record<string, string>)[c] ?? c;
/** 라벨 일련번호 (N° 07) */
export const labelNo = (n: number | undefined) => (n ? `N° ${String(n).padStart(2, "0")}` : "N° —");

/** 평점 숫자 표기 (4 → "4.0") */
export const ratingText = (n: number | null | undefined) => (n ? n.toFixed(1) : "–");
