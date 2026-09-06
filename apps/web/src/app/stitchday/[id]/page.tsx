import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/landing/Container";
// import { PostCoverImage } from "@/components/common/PostCoverImage";
import { PostByline } from "@/features/posts/components/PostByline";
import { PostActions } from "@/features/posts/components/PostActions";
import { PostOwnerActions } from "@/features/posts/components/PostOwnerActions";
import { CommentSection } from "@/features/comments/components/CommentSection";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/formatDate";
// import { getPostById } from "@/data/posts-mock";

type PostDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PostDetailPageProps) {
  const { id } = await params;
  // const post = getPostById(Number(id));
  try {
    const response = await api.get(`/posts/${id}`);

    const postId = response.data.post.id;
    const title = response.data.post.title;
    const content = response.data.post.content;

    if (!postId) {
      return { title: "글을 찾을 수 없음 | 뜨개한 날" };
    }

    return {
      title: `${title} | 뜨개한 날`,
      description: content.slice(0, 120),
    };
  } catch (error) {
    console.error(error);
    return { title: "글을 찾을 수 없음 | 뜨개한 날" };
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  // const postId = Number(id);
  let response,
    postId,
    postUserId,
    category,
    title,
    content,
    author,
    createdAt,
    likes,
    tags;
  let responseComment, mappedComment;
  let prevPost, nextPost, paragraphs;
  try {
    // posts 정보 받아오기
    response = await api.get(`/posts/${id}`);
    postId = response.data.post.id;
    postUserId = response.data.post.user_id;
    category = response.data.post.category;
    title = response.data.post.title;
    content = response.data.post.content;
    author = response.data.post.nickname;
    createdAt = formatDate(response.data.post.created_at);
    likes = response.data.post.like_count;
    tags = response.data.post.tags;
    prevPost = response.data.prevPost ?? null;
    nextPost = response.data.nextPost ?? null;

    // comments 정보 받아오기
    responseComment = await api.get(`/posts/${id}/comments`);
    mappedComment = responseComment.data.comments.map(
      (comment: {
        id: number;
        user_id: number;
        nickname: string;
        created_at: string;
        content: string;
      }) => ({
        id: comment.id,
        userId: comment.user_id,
        author: comment.nickname,
        createdAt: formatDate(comment.created_at),
        content: comment.content,
      }),
    );

    paragraphs = content.split("\n\n");
  } catch (error) {
    console.error(error);
    notFound();
  }

  return (
    <div className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <Link
          href="/stitchday"
          className="text-gray-light hover:text-purple mb-7 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          목록으로
        </Link>

        <PostOwnerActions postId={postId} postUserId={postUserId} />

        {category && (
          <span className="bg-purple-light text-purple inline-block rounded-full px-3 py-1.5 text-xs font-bold">
            {category}
          </span>
        )}

        <h1 className="text-font mt-4 mb-6 text-2xl leading-snug font-extrabold tracking-tight sm:text-3xl">
          {title}
        </h1>

        <PostByline author={author} createdAt={createdAt} likes={likes} />

        <div className="text-font py-8 text-base leading-[1.85]">
          {paragraphs.map((paragraph: string, index: number) => (
            <p key={index} className="mb-6 last:mb-0">
              {paragraph}
            </p>
          ))}

          {/* {post.imageUrl && (
            <div className="my-7 overflow-hidden rounded-2xl">
              <PostCoverImage
                imageUrl={post.imageUrl}
                alt={post.title}
                className="aspect-4/3 h-full w-full object-cover"
              />
            </div>
          )} */}

          <div className="mt-8 flex flex-wrap gap-2">
            {tags.map((tag: string) => (
              <span
                key={tag}
                className="bg-soft-gray text-gray hover:bg-purple-light hover:text-purple rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <PostActions postId={postId} initialLikes={likes} />

        {(prevPost || nextPost) && (
          <nav className="border-beige flex flex-col border-y">
            {prevPost && (
              <Link
                href={`/stitchday/${prevPost.id}`}
                className="border-beige hover:bg-beige-light/60 flex items-center gap-3.5 border-b px-1 py-4 text-sm transition-colors"
              >
                <span className="text-gray-light w-10 flex-none text-xs font-bold">
                  이전
                </span>
                <span className="text-gray truncate font-semibold">
                  {prevPost.title}
                </span>
              </Link>
            )}
            {nextPost && (
              <Link
                href={`/stitchday/${nextPost.id}`}
                className="hover:bg-beige-light/60 flex items-center gap-3.5 px-1 py-4 text-sm transition-colors"
              >
                <span className="text-gray-light w-10 flex-none text-xs font-bold">
                  다음
                </span>
                <span className="text-gray truncate font-semibold">
                  {nextPost.title}
                </span>
              </Link>
            )}
          </nav>
        )}

        <div className="mt-11">
          <CommentSection initialComments={mappedComment} postId={postId} />
        </div>
      </Container>
    </div>
  );
}
