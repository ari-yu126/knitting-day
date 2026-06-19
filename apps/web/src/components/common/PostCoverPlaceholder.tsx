import { cn } from "@/lib/cn";

type PostCoverPlaceholderProps = {
  className?: string;
  ariaLabel: string;
};

export function PostCoverPlaceholder({
  className,
  ariaLabel,
}: PostCoverPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn("post-cover-placeholder h-full w-full", className)}
    />
  );
}
