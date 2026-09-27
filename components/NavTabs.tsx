"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS: [string, string][] = [
  ["/", "향수"],
  ["/collection", "내 컬렉션"],
  ["/wishlist", "위시리스트"],
  ["/calendar", "향뿌캘린더"],
  ["/requests", "신향 요청"],
  ["/newsletter", "뉴스레터"],
];

export default function NavTabs({ pending }: { pending: number }) {
  const path = usePathname() ?? "/";
  const active = (href: string) => (href === "/" ? path === "/" || path.startsWith("/perfumes") : path.startsWith(href));
  return (
    <nav className="tabs">
      {TABS.map(([href, label]) => (
        <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}>
          {label}
          {href === "/requests" && pending > 0 && <span className="count hot">{pending}</span>}
        </Link>
      ))}
    </nav>
  );
}
