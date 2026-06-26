import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/landing/Container";
import { PostCoverImage } from "@/components/common/PostCoverImage";
import { PostByline } from "@/features/posts/components/PostByline";
import { PostActions } from "@/features/posts/components/PostActions";
import { CommentSection } from "@/features/comments/components/CommentSection";
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

  const prevPost = getPostById(postId - 1);
  const nextPost = getPostById(postId + 1);
  const paragraphs = post.content.split("\n\n");

  return (
    <div className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <Link
          href="/stitchday"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-gray-light transition-colors hover:text-purple"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          목록으로
        </Link>

        {post.category && (
          <span className="inline-block rounded-full bg-purple-light px-3 py-1.5 text-xs font-bold text-purple">
            {post.category}
          </span>
        )}

        <h1 className="mt-4 mb-6 text-2xl font-extrabold leading-snug tracking-tight text-font sm:text-3xl">
          {post.title}
        </h1>

        <PostByline author={post.author} createdAt={post.createdAt} likes={post.likes} />

        <div className="py-8 text-base leading-[1.85] text-font">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-6 last:mb-0">
              {paragraph}
            </p>
          ))}

          {post.imageUrl && (
            <div className="my-7 overflow-hidden rounded-2xl">
              <PostCoverImage
                imageUrl={post.imageUrl}
                alt={post.title}
                className="aspect-4/3 h-full w-full object-cover"
              />
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-soft-gray px-3.5 py-1.5 text-xs font-semibold text-gray transition-colors hover:bg-purple-light hover:text-purple"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <PostActions initialLikes={post.likes} />

        {(prevPost || nextPost) && (
          <nav className="flex flex-col border-y border-beige">
            {prevPost && (
              <Link
                href={`/stitchday/${prevPost.id}`}
                className="flex items-center gap-3.5 border-b border-beige px-1 py-4 text-sm transition-colors hover:bg-beige-light/60"
              >
                <span className="w-10 flex-none text-xs font-bold text-gray-light">이전</span>
                <span className="truncate font-semibold text-gray">{prevPost.title}</span>
              </Link>
            )}
            {nextPost && (
              <Link
                href={`/stitchday/${nextPost.id}`}
                className="flex items-center gap-3.5 px-1 py-4 text-sm transition-colors hover:bg-beige-light/60"
              >
                <span className="w-10 flex-none text-xs font-bold text-gray-light">다음</span>
                <span className="truncate font-semibold text-gray">{nextPost.title}</span>
              </Link>
            )}
          </nav>
        )}

        <div className="mt-11">
          <CommentSection initialComments={post.comments} />
        </div>
      </Container>
    </div>
  );
}
