import Link from "next/link";
import { getViewer } from "@/lib/auth";
import type { Banner, Newsletter, Perfume, Slide } from "@/lib/types";
import { DEFAULT_HERO, FALLBACK_PHOTOS, isNew, notesOf, stars, vol2 } from "@/lib/utils";
import BannerCarousel from "@/components/BannerCarousel";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { supabase } = await getViewer();
  const [{ data: banners }, { data: hero }, { data: letter }, { data: fresh }, { data: topReq }, { data: reviews }] = await Promise.all([
    supabase.from("banners").select("*").eq("active", true).order("sort").order("created_at", { ascending: false }),
    supabase.from("site_settings").select("value").eq("key", "hero_image").maybeSingle(),
    supabase.from("newsletters").select("*").order("vol", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("perfumes").select("*").order("created_at", { ascending: false }).limit(3),
    supabase.from("request_board").select("*").eq("status", "pending").order("votes", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("curator_reviews").select("*, perfumes(id, name, brand)").order("updated_at", { ascending: false }).limit(3),
  ]);

  // 새소식 슬라이드: 관리자가 올린 배너 + 자동 소식(최신 뉴스레터, 신향, 요청 1위)
  let photo = 0;
  const nextPhoto = () => FALLBACK_PHOTOS[photo++ % FALLBACK_PHOTOS.length];
  const slides: Slide[] = ((banners ?? []) as Banner[]).map((b) => ({
    id: b.id, eyebrow: b.eyebrow ?? "새소식", title: b.title, text: b.body ?? "", href: b.link || "/", image: b.image_url || nextPhoto(),
  }));
  for (const p of ((fresh ?? []) as Perfume[]).filter(isNew)) {
    slides.push({ id: `new-${p.id}`, eyebrow: `NEW · ${p.brand}`, title: `${p.name} 입고`, text: notesOf(p).slice(0, 4).join(" · "), href: `/perfumes/${p.id}`, image: nextPhoto() });
  }
  if (letter) {
    const n = letter as Newsletter;
    slides.push({ id: `nl-${n.id}`, eyebrow: `Parfumoir Letter · Vol.${vol2(n.vol)}`, title: n.title, text: n.body.split("\n")[0].slice(0, 70), href: `/newsletter/${n.vol}`, image: nextPhoto() });
  }
  if (topReq && topReq.votes > 0) {
    slides.push({ id: `req-${topReq.id}`, eyebrow: "신향 요청 1위", title: `${topReq.brand} ${topReq.name}`, text: `${topReq.votes}명이 기다리고 있어요. 함께 요청해 주세요.`, href: "/requests", image: nextPhoto() });
  }

  return (
    <div className="home">
      <section className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero?.value || DEFAULT_HERO} alt="꽃잎 사이에 놓인 향수병" />
        <div className="hero-text">
          <span className="eyebrow">Parfumoir · 향의 회고록</span>
          <h1>뿌린 날을 기억하는<br />향의 회고록</h1>
          <p>브랜드별 향수와 솔직한 리뷰, 매일 뿌린 향을 적는 캘린더, 취향으로 골라 주는 추천까지. 향을 좋아하는 사람들이 모이는 작은 서재예요.</p>
          <div className="hero-cta">
            <Link className="btn primary" href="/perfumes">향수 둘러보기</Link>
            <Link className="btn ghost-light" href="/calendar">향뿌캘린더 쓰기</Link>
          </div>
        </div>
      </section>

      {slides.length > 0 && (
        <section className="home-sec">
          <div className="sec-h"><h2>새소식</h2><span className="mono muted">{slides.length}개</span></div>
          <BannerCarousel slides={slides} />
        </section>
      )}

      {(reviews ?? []).length > 0 && (
        <section className="home-sec">
          <div className="sec-h"><h2>최근 리뷰</h2><Link className="mono muted" href="/perfumes">전체 향수 →</Link></div>
          <div className="home-reviews">
            {(reviews ?? []).map((r: any) => r.perfumes && (
              <Link key={r.perfume_id} href={`/perfumes/${r.perfume_id}`} className="rcard">
                <span className="bn">{r.perfumes.brand}</span>
                <b>{r.perfumes.name}</b>
                <span className="stars">{stars(r.rating)}</span>
                <p>{r.body}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
