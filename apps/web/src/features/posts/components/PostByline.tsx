"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

type PostBylineProps = {
  author: string;
  createdAt: string;
  likes: number;
};

export function PostByline({ author, createdAt, likes }: PostBylineProps) {
  const [following, setFollowing] = useState(false);

  return (
    <div className="flex items-center gap-3 border-b border-beige pb-5">
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-purple text-base font-bold text-white">
        {author.slice(0, 1)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-font">{author}</p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-gray-light">
          <span>{createdAt}</span>
          <span className="text-gray-light/60">·</span>
          <span>좋아요 {likes}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => setFollowing((value) => !value)}
        className={`rounded-lg border px-4 py-2 text-sm font-bold transition-colors ${
          following
            ? "border-purple bg-purple text-white"
            : "border-purple-light bg-purple-light text-purple hover:bg-purple hover:text-white"
        }`}
      >
        {following ? "팔로잉" : "+ 팔로우"}
      </button>

      <button
        type="button"
        aria-label="더보기"
        className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-gray-light transition-colors hover:bg-soft-gray hover:text-font"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
