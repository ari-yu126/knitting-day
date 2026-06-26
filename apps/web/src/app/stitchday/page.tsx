import Link from "next/link";
import { PenLine } from "lucide-react";
import { Container } from "@/components/landing/Container";
import { PostListRow } from "@/components/posts/PostListRow";
import { PostsPagination } from "@/components/posts/PostsPagination";
import { cn } from "@/lib/cn";
import { getPostsPage, type PostSortKey } from "@/data/posts-mock";

const SORT_OPTIONS: { key: PostSortKey; label: string }[] = [
  { key: "latest", label: "최신순" },
  { key: "popular", label: "인기순" },
  { key: "comments", label: "댓글순" },
];

type PostsPageProps = {
  searchParams: Promise<{ page?: string; sort?: string }>;
};

function buildSortHref(sort: PostSortKey) {
  return sort === "latest" ? "/stitchday" : `/stitchday?sort=${sort}`;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { page: pageParam, sort: sortParam } = await searchParams;
  const page = pageParam ? Number(pageParam) : 1;
  const sort: PostSortKey = SORT_OPTIONS.some(
    (option) => option.key === sortParam,
  )
    ? (sortParam as PostSortKey)
    : "latest";
  const { posts, pagination } = getPostsPage(page, sort);

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <h1 className="text-font text-2xl font-bold sm:text-3xl">
              한코 일기
            </h1>
            <p className="text-gray">
              오늘 뜬 기록, 게이지 고민, 완성 사진을 나눠보세요.
            </p>
          </div>

          <Link
            href="/stitchday/write"
            className="bg-purple text-beige-light inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:opacity-95"
          >
            <PenLine className="h-4 w-4" aria-hidden />
            글쓰기
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-between border-t-2 border-t-base border-b border-b-beige py-3.5">
          <p className="text-gray text-sm">
            총 <span className="text-purple font-bold">{pagination.total}</span>
            개의 글
          </p>
          <div className="flex gap-1">
            {SORT_OPTIONS.map((option) => (
              <Link
                key={option.key}
                href={buildSortHref(option.key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                  option.key === sort
                    ? "bg-purple-light text-purple"
                    : "text-gray-light hover:text-font",
                )}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>

        <ul className="flex flex-col">
          {posts.map((post) => (
            <li key={post.id} className="border-beige border-b">
              <PostListRow post={post} />
            </li>
          ))}
        </ul>

        <PostsPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          sort={sort}
        />
      </Container>
    </div>
  );
}
