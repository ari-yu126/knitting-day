"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { Container } from "./Container";

const STORAGE_KEY = "knitting-day-recent-searches";
const MAX_RECENT = 5;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecent(items: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage 접근 불가 시 무시
  }
}

type SearchPanelProps = {
  onClose: () => void;
};

export function SearchPanel({ onClose }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  // backdrop-filter 안에서 fixed가 안 먹히므로 portal target을 useEffect로 설정
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPortalTarget(document.body);
    setRecent(loadRecent());
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  // Escape 키로 닫기
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [
      trimmed,
      ...recent.filter((r) => r !== trimmed),
    ].slice(0, MAX_RECENT);
    setRecent(updated);
    saveRecent(updated);
    // TODO: 검색 결과 페이지로 이동
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSearch(query);
  }

  function handleRecentClick(term: string) {
    setQuery(term);
    inputRef.current?.focus();
  }

  function removeRecent(term: string) {
    const updated = recent.filter((r) => r !== term);
    setRecent(updated);
    saveRecent(updated);
  }

  return (
    <>
      {/* 백드롭 — body에 portal로 마운트해야 backdrop-filter stacking context 문제를 피할 수 있음 */}
      {portalTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
            aria-hidden
          />,
          portalTarget,
        )}

      {/* 드롭다운 패널 */}
      <div className="border-beige/50 bg-bg absolute top-full right-0 left-0 z-50 border-b shadow-md search-panel-enter">
        <Container>
          <div className="py-5">
            {/* 검색 폼 */}
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  className="text-gray pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden
                />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="뜨개 실, 도안, 기법을 검색해보세요"
                  className="bg-oatmeal text-font focus:ring-purple/20 w-full rounded-full py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-purple text-beige-light shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              >
                검색
              </button>
            </form>

            {/* 최근 검색어 */}
            {recent.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-gray-light mr-1 text-xs font-medium">
                  최근 검색어
                </span>
                {recent.map((term) => (
                  <span
                    key={term}
                    className="bg-oatmeal border-beige/60 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleRecentClick(term)}
                      className="text-font hover:text-purple transition-colors"
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      aria-label={`${term} 삭제`}
                      onClick={() => removeRecent(term)}
                      className="text-gray hover:text-purple ml-0.5 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Container>
      </div>
    </>
  );
}
