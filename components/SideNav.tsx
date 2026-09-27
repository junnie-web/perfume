"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Brand = { brand: string; count: number };
type Props = {
  brands: Brand[];
  pending: number;
  newCount: number;
  user: { name: string; isAdmin: boolean } | null;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={`chev ${open ? "open" : ""}`} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5 6l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Group({ label, open, onToggle, children }: { label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="nav-group">
      <button className="nav-head" aria-expanded={open} onClick={onToggle}>
        <span>{label}</span>
        <Chevron open={open} />
      </button>
      <div className="nav-body" hidden={!open}>{children}</div>
    </div>
  );
}

export default function SideNav({ brands, pending, newCount, user }: Props) {
  const path = usePathname() ?? "/";
  const sp = useSearchParams();
  const brandQ = sp?.get("brand") ?? "";
  const filterQ = sp?.get("filter") ?? "";
  const [drawer, setDrawer] = useState(false);

  const inPerfume = path.startsWith("/perfumes");
  const inMine = ["/collection", "/wishlist", "/calendar"].some((p) => path.startsWith(p));
  const inCommunity = ["/requests", "/newsletter"].some((p) => path.startsWith(p));
  const [open, setOpen] = useState({ perfume: true, brands: !!brandQ, mine: inMine, community: inCommunity });

  // 페이지를 옮기면 해당 메뉴를 펼치고, 폰 화면의 메뉴는 닫아요.
  useEffect(() => {
    setDrawer(false);
    setOpen((o) => ({
      perfume: o.perfume || inPerfume,
      brands: o.brands || !!brandQ,
      mine: o.mine || inMine,
      community: o.community || inCommunity,
    }));
  }, [path, brandQ]); // eslint-disable-line

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  const is = (href: string) => {
    const [p, q] = href.split("?");
    if (p === "/perfumes") {
      if (!path.startsWith("/perfumes") || path !== "/perfumes") return false;
      const params = new URLSearchParams(q ?? "");
      return (params.get("brand") ?? "") === brandQ && (params.get("filter") ?? "") === filterQ;
    }
    return p === "/" ? path === "/" : path.startsWith(p);
  };
  const L = ({ href, children, sub, cls }: { href: string; children: React.ReactNode; sub?: boolean; cls?: string }) => (
    <Link href={href} className={`nav-link ${sub ? "sub" : ""} ${cls ?? ""}`} aria-current={is(href) ? "page" : undefined}>{children}</Link>
  );
  const t = (k: keyof typeof open) => () => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const menu = (
    <nav className="nav" aria-label="사이트 메뉴">
      <L href="/" cls="nav-home">홈</L>
      <Group label="향수" open={open.perfume} onToggle={t("perfume")}>
        <L href="/perfumes">전체 향수</L>
        <L href="/perfumes?filter=new">신제품 {newCount > 0 && <span className="nav-new">NEW {newCount}</span>}</L>
        <button className="nav-head sub" aria-expanded={open.brands} onClick={t("brands")}>
          <span>브랜드</span><Chevron open={open.brands} />
        </button>
        <div className="nav-body" hidden={!open.brands}>
          {brands.map((b) => (
            <L key={b.brand} sub href={`/perfumes?brand=${encodeURIComponent(b.brand)}`}>
              {b.brand}<span className="nav-count">{b.count}</span>
            </L>
          ))}
        </div>
      </Group>
      <Group label="나의 향" open={open.mine} onToggle={t("mine")}>
        <L href="/collection">내 컬렉션</L>
        <L href="/wishlist">위시리스트</L>
        <L href="/calendar">향뿌캘린더</L>
      </Group>
      <Group label="커뮤니티" open={open.community} onToggle={t("community")}>
        <L href="/requests">신제품 요청 {pending > 0 && <span className="nav-badge">{pending}</span>}</L>
        <L href="/newsletter">뉴스레터</L>
      </Group>
      <div className="nav-account">
        {user ? (
          <>
            <L href="/me">{user.name} · 내 정보</L>
            {user.isAdmin && <L href="/admin">관리</L>}
            <form action="/auth/signout" method="post"><button className="nav-link as-btn" type="submit">로그아웃</button></form>
          </>
        ) : (
          <Link className="btn primary" href="/login" style={{ justifyContent: "center" }}>로그인 · 회원가입</Link>
        )}
      </div>
    </nav>
  );

  return (
    <>
      <header className="mtop">
        <button className="burger" aria-label="메뉴 열기" aria-expanded={drawer} onClick={() => setDrawer(true)}>
          <span /><span /><span />
        </button>
        <Link href="/" className="mbrand">Parfumoir</Link>
        <span style={{ width: 40 }} />
      </header>
      {drawer && <div className="scrim" onClick={() => setDrawer(false)} aria-hidden="true" />}
      <aside className={`sidenav ${drawer ? "show" : ""}`}>
        <div className="side-top">
          <Link href="/" className="side-brand">
            <span className="brandmark">Parfumoir</span>
          </Link>
          <button className="close" aria-label="메뉴 닫기" onClick={() => setDrawer(false)}>×</button>
        </div>
        {menu}
      </aside>
    </>
  );
}
