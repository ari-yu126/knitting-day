import Link from "next/link";
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_BLOCK_SIZE = 10;

type PostsPaginationProps = {
  page: number;
  totalPages: number;
};

function getVisiblePageNumbers(page: number, totalPages: number): number[] {
  const blockStart =
    Math.floor((page - 1) / PAGE_BLOCK_SIZE) * PAGE_BLOCK_SIZE + 1;
  const blockEnd = Math.min(blockStart + PAGE_BLOCK_SIZE - 1, totalPages);

  return Array.from(
    { length: blockEnd - blockStart + 1 },
    (_, index) => blockStart + index,
  );
}

export function PostsPagination({ page, totalPages }: PostsPaginationProps) {
  if (totalPages <= 1) return null;

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const pageNumbers = getVisiblePageNumbers(page, totalPages);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="게시글 페이지"
    >
      {page > 1 ? (
        <Link
          href="/stitchday?page=1"
          aria-label="첫 페이지"
          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-2.5 text-sm font-medium text-font transition-colors hover:border-purple/30 hover:text-purple"
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <></>
        // <span
        //   aria-hidden
        //   className="inline-flex items-center gap-1 rounded-2xl border border-beige/60 px-2.5 py-2.5 text-sm text-gray-light"
        // >
        //   <ChevronsLeft className="h-4 w-4" />
        // </span>
      )}
      {prevPage ? (
        <Link
          href={`/stitchday?page=${prevPage}`}
          className="inline-flex items-center gap-1 rounded-xl bg-beige-light/80 px-2.5 py-2.5 text-sm font-medium text-font transition-colors hover:border-purple/30 hover:text-purple"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <></>
        // <span className="inline-flex items-center gap-1 rounded-2xl border border-beige/60 px-2.5 py-2.5 text-sm text-gray-light">
        //   <ChevronLeft className="h-4 w-4" aria-hidden />
        // </span>
      )}

      <div className="flex flex-wrap items-center justify-center gap-1">
        {pageNumbers.map((pageNumber) => {
          const isActive = pageNumber === page;

          return (
            <Link
              key={pageNumber}
              href={`/stitchday?page=${pageNumber}`}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex h-9 min-w-9 items-center justify-center px-2 text-sm font-medium transition-colors ${
                isActive
                  ? "text-purple border-b-purple font-bold"
                  : "hover:border-b border-beige bg-beige-light/80 text-font hover:border-purple/30 hover:text-purple"
              }`}
            >
              {pageNumber}
            </Link>
          );
        })}
      </div>

      {nextPage ? (
        <Link
          href={`/stitchday?page=${nextPage}`}
          className="inline-flex items-center gap-1 bg-beige-light/80 px-2.5 py-2.5 text-sm font-medium text-font transition-colors hover:border-purple/30 hover:text-purple"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <></>
        // <span className="inline-flex items-center gap-1 rounded-xl border border-beige/60 px-2.5 py-2.5 text-sm text-gray-light">
        //   <ChevronRight className="h-4 w-4" aria-hidden />
        // </span>
      )}
      {page < totalPages ? (
        <Link
          href={`/stitchday?page=${totalPages}`}
          aria-label="마지막 페이지"
          className="inline-flex items-center gap-1 bg-beige-light/80 px-2.5 py-2.5 text-sm font-medium text-font transition-colors hover:border-purple/30 hover:text-purple"
        >
          <ChevronsRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <></>
        // <span
        //   aria-hidden
        //   className="inline-flex items-center gap-1 rounded-xl border border-beige/60 px-2.5 py-2.5 text-sm text-gray-light"
        // >
        //   <ChevronsRight className="h-4 w-4" />
        // </span>
      )}
    </nav>
  );
}
