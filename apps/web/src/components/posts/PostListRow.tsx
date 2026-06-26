import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import type { PostListItem } from "@/types/post";
import { PostCoverImage } from "@/components/common/PostCoverImage";

type PostListRowProps = {
  post: PostListItem;
};

export function PostListRow({ post }: PostListRowProps) {
  return (
    <Link
      href={`/stitchday/${post.id}`}
      className="group hover:bg-beige-light/60 flex items-center gap-5 px-3 py-5 transition-colors hover:shadow-[inset_3px_0_0_0_var(--color-purple)] sm:gap-6 sm:px-4"
    >
      <div className="h-16 w-16 flex-none overflow-hidden rounded-xl sm:h-22 sm:w-22 sm:rounded-2xl">
        <PostCoverImage
          imageUrl={post.imageUrl}
          alt={post.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        {post.category && (
          <span className="bg-purple-light text-purple mb-2.5 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold">
            <span className="bg-purple h-1.5 w-1.5 rounded-full" aria-hidden />
            {post.category}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-font group-hover:text-purple truncate text-base font-bold tracking-tight sm:text-lg">
            {post.title}
          </h2>
          {post.commentsCount > 0 && (
            <span className="text-purple text-xs font-bold">
              [{post.commentsCount}]
            </span>
          )}
        </div>

        {post.excerpt && (
          <p className="text-gray mt-1.5 truncate text-sm">{post.excerpt}</p>
        )}

        {post.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {post.tags.map((tag) => (
              <span key={tag} className="text-gray-light text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="text-gray-light mt-2.5 flex items-center gap-2 text-xs">
          <span className="text-gray font-semibold">{post.author}</span>
          <span className="text-gray-light/60">·</span>
          <span>{post.createdAt}</span>
        </div>
      </div>

      <div className="text-gray-light flex flex-none items-center gap-4 text-sm font-semibold">
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-4 w-4" aria-hidden />
          {post.likes}
        </span>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <MessageCircle className="h-4 w-4" aria-hidden />
          {post.commentsCount}
        </span>
      </div>
    </Link>
  );
}
