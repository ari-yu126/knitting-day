import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      data-site-container
      className={cn(
        "mx-auto w-full max-w-site px-5 tablet:px-8 pc:px-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
