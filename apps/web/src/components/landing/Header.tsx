"use client";

import Link from "next/link";
import { useState, useCallback, type MouseEvent } from "react";
import { UserRound, UsersRound, Menu, X, Search } from "lucide-react";
import { MOCK_IS_LOGGED_IN, NAV_LINKS } from "@/data/landing-mock";
import { SearchBar } from "./SearchBar";
import { SearchPanel } from "./SearchPanel";
import { Alarm } from "./AlarmIcon";
import type { NavLinkItem } from "@/types/landing";
import { Container } from "./Container";

const navLinkClass = "text-sm font-medium transition-colors hover:text-purple";

function isNavLinkAvailable(href?: string) {
  if (!href) return false;
  if (!href.startsWith("#")) return true;

  const targetId = href.slice(1);
  return Boolean(targetId && document.getElementById(targetId));
}

function handleNavClick(
  e: MouseEvent<HTMLAnchorElement>,
  href: string | undefined,
  onAfterNavigate?: () => void,
) {
  if (!isNavLinkAvailable(href)) {
    e.preventDefault();
    alert("준비중입니다");
    return;
  }

  onAfterNavigate?.();
}

function NavMenuItem({
  link,
  onNavigate,
}: {
  link: NavLinkItem;
  onNavigate?: () => void;
}) {
  if (!link.href) {
    return (
      <button
        type="button"
        className={navLinkClass}
        onClick={() => alert("준비중입니다")}
      >
        {link.label}
      </button>
    );
  }

  return (
    <Link
      href={link.href}
      className={navLinkClass}
      onClick={(e) => handleNavClick(e, link.href, onNavigate)}
    >
      {link.label}
    </Link>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => {
    setMobileOpen(false);
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  return (
    <header className="border-beige/50 bg-bg sticky top-0 z-50 border-b backdrop-blur-xl">
      <Container>
        <div className="sm:h-4.5rem relative flex h-20 items-center justify-center">
          <Link
            href="/"
            className="group absolute left-0 flex shrink-0 flex-col"
          >
            <span className="text-font group-hover:text-purple text-lg font-bold tracking-tight transition-colors sm:text-xl">
              뜨개한 날
            </span>
            <span className="text-gray text-[10px] font-medium tracking-[0.2em] uppercase">
              Knitting Day
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <NavMenuItem key={link.label} link={link} />
            ))}
          </nav>

          <div className="absolute right-0 hidden items-center gap-4 md:flex">
            <SearchBar onClick={openSearch} />
            <Alarm />
            {MOCK_IS_LOGGED_IN ? (
              <Link
                href="/mypage"
                aria-label="내 프로필 이동"
                className="group"
              >
                <UserRound className="size-5 text-gray group-hover:hidden" />
                <UsersRound className="size-5 text-gray hidden group-hover:block" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="from-purple to-purple-light text-beige-light rounded-2xl bg-linear-to-r px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:opacity-95"
              >
                LOGIN
              </Link>
            )}
          </div>

          {/* 모바일 햄버거 버튼 */}
          <button
            type="button"
            aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={mobileOpen}
            className="absolute right-0 flex items-center justify-center md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? (
              <X className="size-6 text-gray" />
            ) : (
              <Menu className="size-6 text-gray" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <nav className="border-beige/60 flex flex-col gap-4 border-t py-4 md:hidden">
            {NAV_LINKS.map((link) => (
              <NavMenuItem
                key={link.label}
                link={link}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}

            {/* 모바일 인라인 검색 */}
            <form
              className="flex items-center gap-2 pt-1"
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector("input");
                const term = input?.value.trim();
                if (term) setMobileOpen(false);
                // TODO: 검색 결과 페이지로 이동
              }}
            >
              <div className="relative flex-1">
                <Search
                  className="text-gray pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="검색"
                  className="bg-oatmeal focus:ring-purple/20 w-full rounded-full py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-purple text-beige-light shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold"
              >
                검색
              </button>
            </form>

            <div className="flex items-center gap-3">
              <Alarm />
            </div>
            {MOCK_IS_LOGGED_IN ? (
              <Link
                href="/mypage"
                aria-label="내 프로필 이동"
                className="group flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <UserRound className="size-5 text-gray group-hover:hidden" />
                <UsersRound className="size-5 text-gray hidden group-hover:block" />
                <span className="text-sm font-medium">마이페이지</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="from-purple to-purple-light text-beige-light inline-flex justify-center rounded-2xl bg-linear-to-r px-5 py-2.5 text-sm font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                LOGIN
              </Link>
            )}
          </nav>
        )}
      </Container>

      {/* 검색 패널 + 백드롭 */}
      {searchOpen && <SearchPanel onClose={closeSearch} />}
    </header>
  );
}
