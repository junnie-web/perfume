import Link from "next/link";
import type { Perfume } from "@/lib/types";
import { isNew, notesOf, stars } from "@/lib/utils";
import FamDot from "./FamDot";
import { HeartButton } from "./ToggleButtons";

export default function PerfumeCard({
  p, rating, wished, owned, loggedIn,
}: { p: Perfume; rating?: number | null; wished: boolean; owned: boolean; loggedIn: boolean }) {
  return (
    <article className="card">
      <HeartButton id={p.id} on={wished} loggedIn={loggedIn} />
      <Link className="open" href={`/perfumes/${p.id}`}>
        <span className="bn">
          {isNew(p) && <span className="new">NEW</span>}
          {owned && <span className="own">보유</span>}
          {p.brand}
        </span>
        <span className="nm">{p.name}</span>
        {p.name_ko && <span className="ko">{p.name_ko}</span>}
        <span className="notes">{notesOf(p).slice(0, 5).join(" · ")}</span>
      </Link>
      <div className="meta">
        <FamDot family={p.family} />
        <span className="chip">{p.family}</span>
        <span className="tag">{p.conc}</span>
        {rating ? (
          <span className="stars" style={{ marginLeft: "auto" }} aria-label={`큐레이터 별점 ${rating}점`}>{stars(rating)}</span>
        ) : (
          <span className="muted" style={{ marginLeft: "auto", fontSize: 12 }}>리뷰 준비 중</span>
        )}
      </div>
    </article>
  );
}
