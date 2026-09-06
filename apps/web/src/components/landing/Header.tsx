"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { UserRound, UsersRound, Menu, X, Search } from "lucide-react";
import { NAV_LINKS } from "@/data/landing-mock";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { SearchBar } from "./SearchBar";
import { SearchPanel } from "./SearchPanel";
import { Alarm } from "./AlarmIcon";
import type { NavLinkItem } from "@/types/landing";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { Container } from "./Container";

const navLinkClass =
  "py-1.5 text-sm font-medium transition-colors hover:text-purple md:py-0 hover:font-bold";

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
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const [mounted, setMounted] = useState(false);
  const hasToken = useAuthStore((state) => Boolean(state.token));
  const isLoggedIn = mounted && hasToken;
  const pathname = usePathname();
  const loginHref = `/login?redirect=${encodeURIComponent(pathname)}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 새로고침 등으로 localStorage에서 토큰을 복원했을 때, 그 토큰이 아직도
    // 서버 기준으로 유효한지 실제로 확인한다 (그냥 "토큰이 있다"만으로 로그인 상태를 믿지 않음).
    // 만료/위조된 토큰이면 서버가 401을 주고, api.ts의 공통 401 처리가 로그아웃시켜서
    // hasToken이 false가 되고 이 컴포넌트도 자동으로 로그아웃 상태로 다시 렌더링된다.
    if (!mounted || !hasToken) return;
    api.get("/users/me").catch(() => {});
  }, [mounted, hasToken]);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMobileMenu();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeMobileMenu]);

  const openSearch = useCallback(() => {
    setMobileOpen(false);
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  useBodyScrollLock(mobileOpen || searchOpen);

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
            {isLoggedIn ? (
              <Link
                href="/mypage"
                aria-label="내 프로필 이동"
                className="group"
              >
                <UserRound className="text-gray size-5 group-hover:hidden" />
                <UsersRound className="text-gray hidden size-5 group-hover:block" />
              </Link>
            ) : (
              <Link
                href={loginHref}
                className="bg-purple text-beige-light rounded-2xl bg-linear-to-r px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:opacity-95"
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
              <X className="text-gray size-6" />
            ) : (
              <Menu className="text-gray size-6" />
            )}
          </button>
        </div>

        {mobileOpen &&
          portalTarget &&
          createPortal(
            <button
              type="button"
              aria-label="메뉴 닫기"
              className="fixed inset-0 top-20 z-40 bg-black/40 md:hidden"
              onClick={closeMobileMenu}
            />,
            portalTarget,
          )}

        {mobileOpen && (
          <nav className="border-beige/60 bg-bg fixed top-20 right-0 left-0 z-50 flex flex-col gap-4 border-t border-b px-6 py-6 md:hidden">
            {NAV_LINKS.map((link) => (
              <NavMenuItem
                key={link.label}
                link={link}
                onNavigate={closeMobileMenu}
              />
            ))}

            {/* 모바일 인라인 검색 */}
            <form
              className="border-beige/60 flex items-center gap-2 border-t pt-5"
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector("input");
                const term = input?.value.trim();
                if (term) closeMobileMenu();
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

            <div className="flex flex-row items-center justify-end gap-4 pt-2 pb-4">
              <div className="flex items-center gap-3">
                <Alarm />
              </div>
              {isLoggedIn ? (
                <Link
                  href="/mypage"
                  aria-label="내 프로필 이동"
                  className="group flex items-center gap-2"
                  onClick={closeMobileMenu}
                >
                  <UserRound className="text-gray size-5 group-hover:hidden" />
                  <UsersRound className="text-gray hidden size-5 group-hover:block" />
                  <span className="text-sm font-medium">마이페이지</span>
                </Link>
              ) : (
                <Link
                  href={loginHref}
                  className="from-purple to-purple-light text-beige-light inline-flex justify-center rounded-2xl bg-linear-to-r px-5 py-2.5 text-sm font-semibold"
                  onClick={closeMobileMenu}
                >
                  LOGIN
                </Link>
              )}
            </div>
          </nav>
        )}
      </Container>

      {/* 검색 패널 + 백드롭 */}
      {searchOpen && <SearchPanel onClose={closeSearch} />}
    </header>
  );
}
