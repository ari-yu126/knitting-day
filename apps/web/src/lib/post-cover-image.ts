/** Default cover when a post has no image (shared across pages) */
export const POST_DEFAULT_THUMBNAILS = [
  "/images/img_thumbnail_01.jpg",
  "/images/img_thumbnail_02.jpeg",
  "/images/img_thumbnail_03.jpeg",
  "/images/img_thumbnail_04.jpeg",
] as const;

/** Stable thumbnail per post id (SSR-safe; varies across posts) */
export function getDefaultPostThumbnail(seed: number): string {
  const index = Math.abs((seed * 17 + 3) % POST_DEFAULT_THUMBNAILS.length);
  return POST_DEFAULT_THUMBNAILS[index];
}

export function resolvePostCoverImageUrl(options: {
  postId: number;
  imageUrl?: string | null;
}): string {
  const trimmed = options.imageUrl?.trim();
  if (trimmed) return trimmed;
  return getDefaultPostThumbnail(options.postId);
}
