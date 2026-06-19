import Link from "next/link";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { MobilePagePicker } from "@/components/posts/MobilePagePicker";

const TABLET_PC_PAGE_BLOCK_SIZE = 10;

const navControlClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md text-font transition-colors hover:bg-purple-light";

type PostsPaginationProps = {
  page: number;
  totalPages: number;
};

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
}: {
  pageNumbers: number[];
  currentPage: number;
}) {
  return (
    <>
      {pageNumbers.map((pageNumber) => {
        const isActive = pageNumber === currentPage;

        return (
          <Link
            key={pageNumber}
            href={`/stitchday?page=${pageNumber}`}
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

export function PostsPagination({ page, totalPages }: PostsPaginationProps) {
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
          href="/stitchday?page=1"
          aria-label="첫 페이지"
          className={navControlClass}
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}

      {prevPage ? (
        <Link
          href={`/stitchday?page=${prevPage}`}
          aria-label="이전 페이지"
          className={navControlClass}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}

      <div className="md:hidden">
        <MobilePagePicker page={page} totalPages={totalPages} />
      </div>
      <div className="hidden flex-wrap items-center justify-center gap-2 md:flex md:gap-1">
        <PageNumberLinks pageNumbers={tabletPcPageNumbers} currentPage={page} />
      </div>

      {nextPage ? (
        <Link
          href={`/stitchday?page=${nextPage}`}
          aria-label="다음 페이지"
          className={navControlClass}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}

      {page < totalPages ? (
        <Link
          href={`/stitchday?page=${totalPages}`}
          aria-label="마지막 페이지"
          className={navControlClass}
        >
          <ChevronsRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </nav>
  );
}
