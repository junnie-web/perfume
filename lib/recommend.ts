import type { Perfume } from "./types";
import { notesOf } from "./utils";

export type Pick = { id: string; why: string };
export type RecResult = { source: "ai" | "local"; taste: string; picks: Pick[] };

/** AI를 쓸 수 없을 때: 노트·계열·계절이 겹치는 정도로 추천 */
export function localRecommend(catalog: Perfume[], likedIds: string[], excludeIds: Set<string>): RecResult {
  const liked = likedIds.map((id) => catalog.find((p) => p.id === id)).filter(Boolean) as Perfume[];
  const noteCount: Record<string, number> = {};
  const famCount: Record<string, number> = {};
  const seasonCount: Record<string, number> = {};
  for (const p of liked) {
    for (const n of notesOf(p)) noteCount[n] = (noteCount[n] ?? 0) + 1;
    famCount[p.family] = (famCount[p.family] ?? 0) + 1;
    for (const s of p.seasons ?? []) seasonCount[s] = (seasonCount[s] ?? 0) + 1;
  }
  const ranked = catalog
    .filter((p) => !excludeIds.has(p.id))
    .map((p) => {
      const shared = notesOf(p).filter((n) => noteCount[n]);
      const score =
        shared.reduce((a, n) => a + noteCount[n] * 2, 0) +
        (famCount[p.family] ?? 0) * 3 +
        (p.seasons ?? []).reduce((a, s) => a + (seasonCount[s] ?? 0), 0);
      return { p, shared, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  const topFam = Object.entries(famCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  return {
    source: "local",
    taste: topFam ? `${topFam} 계열을 중심으로 담아 두셨어요.` : "",
    picks: ranked.map(({ p, shared }) => ({
      id: p.id,
      why: shared.length
        ? `담아 둔 향수와 ${shared.slice(0, 3).join(", ")} 노트가 겹쳐요.`
        : `${p.family} 계열로 취향의 폭을 넓혀 볼 수 있어요.`,
    })),
  };
}
