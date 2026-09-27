import Link from "next/link";
import type { Perfume } from "@/lib/types";
import { isNew } from "@/lib/utils";
import Rating from "./Rating";
import { HeartButton } from "./ToggleButtons";

/** 향수 카드: 브랜드 · 이름 · 계열/부향률 · 평점 · 하트, 딱 다섯 가지 */
export default function PerfumeCard({
  p, rating, wished, owned, loggedIn,
}: { p: Perfume; rating?: number | null; wished: boolean; owned: boolean; loggedIn: boolean }) {
  return (
    <article className="card">
      <HeartButton id={p.id} on={wished} loggedIn={loggedIn} />
      <Link className="open" href={`/perfumes/${p.id}`}>
        <span className="bn">
          {p.brand}
          {isNew(p) && <span className="new">NEW</span>}
          {owned && <span className="own">보유</span>}
        </span>
        <span className="nm">{p.name}</span>
        <span className="fam">{p.family} · {p.conc}</span>
      </Link>
      <div className="meta">
        {rating ? <Rating value={rating} /> : <span className="muted small">리뷰 준비 중</span>}
      </div>
    </article>
  );
}
