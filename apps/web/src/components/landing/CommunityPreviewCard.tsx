import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { PostCoverImage } from "@/components/common/PostCoverImage";
import type { PostListItem } from "@/types/post";

type CommunityPreviewCardProps = {
  post: PostListItem;
};

export function CommunityPreviewCard({ post }: CommunityPreviewCardProps) {
  return (
    <Link
      href={`/stitchday/${post.id}`}
      className="group bg-beige-light/80 flex h-full flex-col overflow-hidden transition-all"
      aria-labelledby={`community-preview-${post.id}`}
    >
      <div className="bg-oatmeal aspect-4/4 overflow-hidden rounded-2xl">
        <PostCoverImage
          postId={post.id}
          imageUrl={post.imageUrl}
          alt={`${post.title} 썸네일`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {post.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="해시태그">
            {post.tags.map((tag) => (
              <li key={tag}>
                <span className="bg-purple/10 text-purple inline-block rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {tag}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <h3
          id={`community-preview-${post.id}`}
          className="text-font group-hover:text-purple line-clamp-1 text-xl leading-snug font-semibold"
        >
          {post.title}
        </h3>

        {post.excerpt ? (
          <p className="text-gray line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        ) : null}

        <div className="text-gray mt-auto flex items-center justify-between gap-2 pt-2 text-xs">
          <span className="truncate font-medium">{post.author}</span>
          <div className="flex shrink-0 items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" aria-hidden />
              {post.likes}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              {post.commentsCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
