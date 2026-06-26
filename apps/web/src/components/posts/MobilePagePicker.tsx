"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PostSortKey } from "@/data/posts-mock";

type MobilePagePickerProps = {
  page: number;
  totalPages: number;
  sort?: PostSortKey;
};

export function MobilePagePicker({
  page,
  totalPages,
  sort,
}: MobilePagePickerProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`현재 ${page}페이지, 전체 ${totalPages}페이지. 페이지 선택`}
        className="text-font hover:text-purple hover:border-purple/30 inline-flex h-9 min-w-[4.5rem] items-center justify-center gap-1 rounded-md border border-transparent px-2 text-sm font-medium transition-colors"
      >
        <span className="text-purple font-bold">{page}</span>
        <span className="text-gray">/</span>
        <span>{totalPages}</span>
        <ChevronDown
          className={cn(
            "text-gray h-4 w-4 shrink-0 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="페이지 선택"
          className="border-beige bg-beige-light absolute bottom-full left-1/2 z-10 mb-2 max-h-48 w-36 -translate-x-1/2 overflow-y-auto rounded-xl border py-1"
        >
          {pages.map((pageNumber) => {
            const isActive = pageNumber === page;

            return (
              <li
                key={pageNumber}
                role="option"
                aria-selected={isActive}
              >
                <button
                  type="button"
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm transition-colors",
                    isActive
                      ? "text-purple bg-purple/10 font-bold"
                      : "text-font hover:bg-beige/60",
                  )}
                  onClick={() => {
                    setOpen(false);
                    router.push(
                      sort && sort !== "latest"
                        ? `/stitchday?page=${pageNumber}&sort=${sort}`
                        : `/stitchday?page=${pageNumber}`,
                    );
                  }}
                >
                  {pageNumber}페이지
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
