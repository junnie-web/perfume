"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Perfume } from "@/lib/types";
import { isNew, norm, notesOf } from "@/lib/utils";
import PerfumeCard from "./PerfumeCard";
import RequestForm from "./RequestForm";

type Props = {
  perfumes: Perfume[];
  ratings: Record<string, number>;
  wished: string[];
  owned: string[];
  loggedIn: boolean;
  pendingRequests: { id: string; brand: string; name: string; votes: number }[];
  brand: string;
  onlyNew: boolean;
};

export default function Shelf({ perfumes, ratings, wished, owned, loggedIn, pendingRequests, brand, onlyNew }: Props) {
  const [q, setQ] = useState("");
  const wishSet = useMemo(() => new Set(wished), [wished]);
  const ownSet = useMemo(() => new Set(owned), [owned]);
  const nq = norm(q);

  let list = perfumes;
  if (brand) list = list.filter((p) => p.brand === brand);
  if (onlyNew) list = list.filter(isNew);
  if (nq) {
    list = perfumes.filter((p) =>
      norm([p.brand, p.brand_ko, p.name, p.name_ko, p.family, ...notesOf(p)].join(" ")).includes(nq)
    );
  }
  list = [...list].sort((a, b) => Number(isNew(b)) - Number(isNew(a)));
  const reqMatches = nq ? pendingRequests.filter((r) => norm(r.brand + r.name).includes(nq)) : [];

  return (
    <div>
      <div className="shelf-head">
        <div>
          <div className="eyebrow">{brand ? "Brand" : onlyNew ? "New arrivals" : "All perfumes"}</div>
          <h2>{brand || (onlyNew ? "신향" : "전체 향수")}</h2>
        </div>
        <span className="mono muted">{list.length}개</span>
      </div>
      <section>
        <div className="search">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="향수, 브랜드, 노트로 검색 (예: 상탈, 무화과, 바이레도)"
            aria-label="향수 검색"
            autoComplete="off"
          />
          {q && <button className="btn ghost" onClick={() => setQ("")}>지우기</button>}
        </div>

        {nq && !list.length && (
          <div className="miss">
            <div>
              <div className="eyebrow">검색 결과 없음</div>
              <h3>&lsquo;{q}&rsquo;은(는) 아직 Parfumoir에 없어요</h3>
              <p className="muted" style={{ margin: "4px 0 0" }}>추가를 요청해 주세요. 요청이 많이 쌓인 향수부터 등록돼요.</p>
            </div>
            {reqMatches.length > 0 && (
              <p style={{ margin: 0, fontSize: 14 }}>
                비슷한 요청이 이미 있어요:{" "}
                {reqMatches.map((r, i) => (
                  <span key={r.id}>{i > 0 && ", "}<Link href="/requests">{r.brand} {r.name} ({r.votes}명)</Link></span>
                ))}
              </p>
            )}
            <RequestForm initialName={q} loggedIn={loggedIn} compact />
          </div>
        )}
        {nq && list.length > 0 && (
          <p className="muted" style={{ fontSize: 13, margin: "0 0 12px" }}>
            {list.length}개 찾음 · 찾는 향수가 없나요? <Link href="/requests">추가 요청하기</Link>
          </p>
        )}

        {!nq && list.length === 0 && (
          <div className="empty">{onlyNew ? "최근 30일 안에 새로 들어온 향수가 아직 없어요." : "아직 등록된 향수가 없어요."}</div>
        )}
        <div className="grid">
          {list.map((p) => (
            <PerfumeCard key={p.id} p={p} rating={ratings[p.id]} wished={wishSet.has(p.id)} owned={ownSet.has(p.id)} loggedIn={loggedIn} />
          ))}
        </div>
      </section>
    </div>
  );
}
