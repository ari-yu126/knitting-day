import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle } from "lucide-react";
import { Container } from "@/components/landing/Container";
import { getPostById } from "@/data/posts-mock";

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PostDetailPageProps) {
  const { id } = await params;
  const post = getPostById(Number(id));

  if (!post) {
    return { title: "글을 찾을 수 없음 | 뜨개한 날" };
  }

  return {
    title: `${post.title} | 뜨개한 날`,
    description: post.content.slice(0, 120),
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isFinite(postId)) {
    notFound();
  }

  const post = getPostById(postId);

  if (!post) {
    notFound();
  }

  return (
    <div className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <Link
          href="/stitchday"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray transition-colors hover:text-purple"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          목록으로
        </Link>

        <article className="rounded-3xl border border-beige/80 bg-beige-light/80 p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-purple/10 px-3 py-1 text-xs font-medium text-purple"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl font-bold leading-snug text-font sm:text-3xl">
            {post.title}
          </h1>

          <p className="mt-4 text-sm text-gray">
            {post.author} · {post.createdAt}
          </p>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-4 w-4" aria-hidden />
              {post.likes}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-4 w-4" aria-hidden />
              {post.commentsCount}
            </span>
          </div>

          <div className="mt-8 whitespace-pre-line text-sm leading-relaxed text-font sm:text-base">
            {post.content}
          </div>
        </article>

        <section className="mt-10" aria-labelledby="comments-heading">
          <h2
            id="comments-heading"
            className="mb-4 text-lg font-semibold text-font"
          >
            댓글 {post.comments.length > 0 ? post.comments.length : post.commentsCount}
          </h2>

          {post.comments.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {post.comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-2xl border border-beige/80 bg-beige-light/60 px-5 py-4"
                >
                  <p className="text-sm font-semibold text-font">
                    {comment.author}
                    <span className="ml-2 font-normal text-gray">
                      {comment.createdAt}
                    </span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-font">
                    {comment.content}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-beige bg-beige-light/40 px-5 py-8 text-center text-sm text-gray">
              아직 댓글이 없어요. 첫 댓글을 남겨보세요.
            </p>
          )}

          <p className="mt-4 text-xs text-gray-light">
            댓글 작성은 로그인 연동 후 제공됩니다. (목업)
          </p>
        </section>
      </Container>
    </div>
  );
}
