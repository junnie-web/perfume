import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { localRecommend, type RecResult } from "@/lib/recommend";
import type { Perfume } from "@/lib/types";
import { notesOf } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const since = new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10);
  const [{ data: perfumes }, { data: wish }, { data: col }, { data: logs }] = await Promise.all([
    supabase.from("perfumes").select("*"),
    supabase.from("wishlist").select("perfume_id"),
    supabase.from("collection").select("perfume_id"),
    supabase.from("wear_logs").select("perfume_id").gte("day", since),
  ]);
  const catalog = (perfumes ?? []) as Perfume[];
  const wishIds = (wish ?? []).map((r) => r.perfume_id);
  const ownIds = (col ?? []).map((r) => r.perfume_id);
  const worn: Record<string, number> = {};
  for (const l of logs ?? []) worn[l.perfume_id] = (worn[l.perfume_id] ?? 0) + 1;
  const exclude = new Set([...wishIds, ...ownIds]);
  if (!wishIds.length && !ownIds.length)
    return NextResponse.json({ error: "위시리스트나 컬렉션에 향수를 먼저 담아 주세요." }, { status: 400 });

  let result: RecResult | null = null;
  let note = "";
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic();
      const compact = catalog.map((p) => ({ id: p.id, brand: p.brand, name: p.name, family: p.family, notes: notesOf(p), seasons: p.seasons, mood: p.mood }));
      const prompt = `너는 향수 큐레이션 사이트 'Parfumoir(파퓨무아)'의 추천 엔진이야. 스포티파이의 '당신을 위한 추천'처럼, 사용자의 위시리스트·보유 컬렉션·최근 착용 기록을 보고 카탈로그에서 3~4개를 골라 줘.

규칙:
- 위시리스트나 보유 컬렉션에 이미 있는 id는 제외해.
- 반드시 카탈로그에 있는 id만 써.
- 3개는 취향에 딱 맞는 것, 1개는 조금 새로운 방향으로.
- why는 한국어 1~2문장. 사용자가 담아 둔 어떤 향수와 어떤 노트/분위기가 이어지는지 구체적으로.
- taste는 사용자 취향을 한 문장으로 요약 (한국어, 존댓말).

JSON만 답해: {"taste":"...","picks":[{"id":"...","why":"..."}]}

위시리스트(살 예정): ${JSON.stringify(wishIds)}
보유 컬렉션: ${JSON.stringify(ownIds)}
최근 60일 착용 횟수: ${JSON.stringify(worn)}
카탈로그: ${JSON.stringify(compact)}`;
      const msg = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      });
      const text = msg.content.map((b: any) => (b.type === "text" ? b.text : "")).join("");
      const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
      const picks = (json.picks ?? [])
        .map((r: any) => ({ id: String(r.id), why: String(r.why ?? "") }))
        .filter((r: any) => catalog.some((p) => p.id === r.id) && !exclude.has(r.id))
        .slice(0, 4);
      if (picks.length >= 2) result = { source: "ai", taste: String(json.taste ?? ""), picks };
    } catch (e) {
      console.error("AI recommend failed", e);
      note = "AI 추천이 잠시 안 돼서 노트 매칭으로 골랐어요.";
    }
  }
  if (!result) result = localRecommend(catalog, [...wishIds, ...ownIds, ...Object.keys(worn)], exclude);

  const byId = Object.fromEntries(catalog.map((p) => [p.id, p]));
  return NextResponse.json({
    ...result,
    note,
    picks: result.picks.map((r) => ({ ...r, name: byId[r.id].name, brand: byId[r.id].brand, family: byId[r.id].family })),
  });
}
