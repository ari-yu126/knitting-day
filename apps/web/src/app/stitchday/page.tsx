import Link from "next/link";
import { PenLine } from "lucide-react";
import { Container } from "@/components/landing/Container";
import { PostCard } from "@/components/posts/PostCard";
import { PostsPagination } from "@/components/posts/PostsPagination";
import { getPostsPage } from "@/data/posts-mock";

type PostsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Number(pageParam) : 1;
  const { posts, pagination } = getPostsPage(page);

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

        <div className="mt-6 flex flex-col gap-4">
          <p className="text-gray text-sm">총 {pagination.total}개의 글</p>

          <ul className="border-beige bg-beige-light/40 overflow-hidden rounded-2xl border">
            {posts.map((post) => (
              <li
                key={post.id}
                className="border-beige border-t first:border-t-0"
              >
                <PostCard post={post} variant="stack" />
              </li>
            ))}
          </ul>
        </div>

        <PostsPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      </Container>
    </div>
  );
}
