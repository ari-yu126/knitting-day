import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import type { PostListItem } from "@/types/post";

type PostCardProps = {
  post: PostListItem;
  className?: string;
  /** "stack" matches landing community list (vertical rows in one panel) */
  variant?: "card" | "stack";
};

export function PostCard({
  post,
  className = "",
  variant = "card",
}: PostCardProps) {
  const isStack = variant === "stack";

  const baseStack =
    "group flex w-full flex-col gap-4 p-6 text-left transition-all duration-300 hover:bg-beige-light/80";
  const baseCard =
    "group flex flex-col gap-4 rounded-3xl border border-beige/80 bg-beige-light/80 p-6 backdrop-blur-sm transition-all hover:border-purple/30";

  return (
    <Link
      href={`/stitchday/${post.id}`}
      className={`${isStack ? baseStack : baseCard} ${className}`}
      aria-labelledby={`post-title-${post.id}`}
    >
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-purple/10 px-3 py-1 text-xs font-medium text-purple"
          >
            {tag}
          </span>
        ))}
      </div>

      <h2
        id={`post-title-${post.id}`}
        className={`font-semibold leading-snug text-font group-hover:text-purple ${
          isStack ? "text-base" : "text-base sm:text-lg"
        }`}
      >
        {post.title}
      </h2>

      <p className={`text-gray ${isStack ? "text-xs" : "text-xs sm:text-sm"}`}>
        {post.author} · {post.createdAt}
      </p>

      <div className="mt-auto flex items-center gap-4 text-sm text-gray">
        <span className="inline-flex items-center gap-1">
          <Heart className="h-4 w-4" aria-hidden />
          {post.likes}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-4 w-4" aria-hidden />
          {post.commentsCount}
        </span>
      </div>
    </Link>
  );
}
