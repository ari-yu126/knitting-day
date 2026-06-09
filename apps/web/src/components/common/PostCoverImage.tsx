import { resolvePostCoverImageUrl } from "@/lib/post-cover-image";

type PostCoverImageProps = {
  postId: number;
  imageUrl?: string | null;
  alt: string;
  className?: string;
};

export function PostCoverImage({
  postId,
  imageUrl,
  alt,
  className,
}: PostCoverImageProps) {
  const src = resolvePostCoverImageUrl({ postId, imageUrl });

  return <img src={src} alt={alt} className={className} />;
}
