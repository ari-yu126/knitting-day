import { cn } from "@/lib/cn";
import { hasPostCoverImage } from "@/lib/post-cover-image";
import { PostCoverPlaceholder } from "@/components/common/PostCoverPlaceholder";

type PostCoverImageProps = {
  imageUrl?: string | null;
  alt: string;
  className?: string;
};

export function PostCoverImage({
  imageUrl,
  alt,
  className,
}: PostCoverImageProps) {
  if (hasPostCoverImage(imageUrl)) {
    return (
      <img src={imageUrl!.trim()} alt={alt} className={cn(className)} />
    );
  }

  return (
    <PostCoverPlaceholder ariaLabel={alt} className={className} />
  );
}
