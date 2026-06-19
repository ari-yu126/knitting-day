export function hasPostCoverImage(imageUrl?: string | null): boolean {
  return Boolean(imageUrl?.trim());
}
