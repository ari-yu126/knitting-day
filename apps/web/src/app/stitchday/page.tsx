import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/formatDate";
import { PenLine } from "lucide-react";
import { Container } from "@/components/landing/Container";
import { PostListRow } from "@/components/posts/PostListRow";
import { PostsPagination } from "@/components/posts/PostsPagination";

type PostsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? Number(pageParam) : 1;
  const response = await api.get(`/posts`, { params: { page } });
  const mappedPosts = response.data.posts.map((post: any) => ({
    id: post.id,
    userId: post.user_id,
    category: post.category,
    title: post.title,
    content: post.content,
    tags: post.tags,
    author: post.nickname,
    likes: post.like_count,
    commentsCount: post.comment_count,
    createdAt: formatDate(post.created_at),
    updatedAt: post.updated_at,
  }));
  const pagination = {
    page: response.data.currentPage,
    totalPages: response.data.totalPages,
    total: response.data.totalCount,
  };

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

        <div className="border-t-base border-b-beige mt-6 flex items-center justify-between border-t-2 border-b py-3.5">
          <p className="text-gray text-sm">
            총 <span className="text-purple font-bold">{pagination.total}</span>
            개의 글
          </p>
        </div>

        <ul className="flex flex-col">
          {mappedPosts.map((post: any) => (
            <li key={post.id} className="border-beige border-b">
              <PostListRow post={post} />
            </li>
          ))}
        </ul>

        <PostsPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      </Container>
    </div>
  );
}
