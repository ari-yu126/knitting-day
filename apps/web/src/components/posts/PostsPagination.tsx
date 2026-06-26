import Link from "next/link";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { MobilePagePicker } from "@/components/posts/MobilePagePicker";
import type { PostSortKey } from "@/data/posts-mock";

const TABLET_PC_PAGE_BLOCK_SIZE = 10;

const navControlClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-font transition-colors hover:bg-purple-light";

type PostsPaginationProps = {
  page: number;
  totalPages: number;
  sort?: PostSortKey;
};

function buildPageHref(page: number, sort?: PostSortKey) {
  return sort && sort !== "latest"
    ? `/stitchday?page=${page}&sort=${sort}`
    : `/stitchday?page=${page}`;
}

function getVisiblePageNumbers(
  page: number,
  totalPages: number,
  blockSize: number,
): number[] {
  const blockStart = Math.floor((page - 1) / blockSize) * blockSize + 1;
  const blockEnd = Math.min(blockStart + blockSize - 1, totalPages);

  return Array.from(
    { length: blockEnd - blockStart + 1 },
    (_, index) => blockStart + index,
  );
}

function PageNumberLinks({
  pageNumbers,
  currentPage,
  sort,
}: {
  pageNumbers: number[];
  currentPage: number;
  sort?: PostSortKey;
}) {
  return (
    <>
      {pageNumbers.map((pageNumber) => {
        const isActive = pageNumber === currentPage;

        return (
          <Link
            key={pageNumber}
            href={buildPageHref(pageNumber, sort)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "hover:bg-purple-light inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium transition-all",
              isActive
                ? "bg-purple text-beige-light border-transparent font-bold"
                : "text-font hover:text-purple hover:border-purple/30 border-transparent",
            )}
          >
            {pageNumber}
          </Link>
        );
      })}
    </>
  );
}

export function PostsPagination({
  page,
  totalPages,
  sort,
}: PostsPaginationProps) {
  if (totalPages <= 1) return null;

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const tabletPcPageNumbers = getVisiblePageNumbers(
    page,
    totalPages,
    TABLET_PC_PAGE_BLOCK_SIZE,
  );

  return (
    <nav
      className="mt-10 flex flex-nowrap items-center justify-center gap-2 md:gap-1"
      aria-label="게시글 페이지"
    >
      {page > 1 ? (
        <Link
          href={buildPageHref(1, sort)}
          aria-label="첫 페이지"
          className={navControlClass}
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}

      {prevPage ? (
        <Link
          href={buildPageHref(prevPage, sort)}
          aria-label="이전 페이지"
          className={navControlClass}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}

      <div className="md:hidden">
        <MobilePagePicker page={page} totalPages={totalPages} sort={sort} />
      </div>
      <div className="hidden flex-wrap items-center justify-center gap-2 md:flex md:gap-1">
        <PageNumberLinks
          pageNumbers={tabletPcPageNumbers}
          currentPage={page}
          sort={sort}
        />
      </div>

      {nextPage ? (
        <Link
          href={buildPageHref(nextPage, sort)}
          aria-label="다음 페이지"
          className={navControlClass}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}

      {page < totalPages ? (
        <Link
          href={buildPageHref(totalPages, sort)}
          aria-label="마지막 페이지"
          className={navControlClass}
        >
          <ChevronsRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
