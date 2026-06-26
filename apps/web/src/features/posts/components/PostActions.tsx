"use client";

import { useState } from "react";
import { Heart, Bookmark, Share2 } from "lucide-react";

type PostActionsProps = {
  initialLikes: number;
};

export function PostActions({ initialLikes }: PostActionsProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex items-center justify-center gap-3 py-9">
      <button
        type="button"
        onClick={() => setLiked((value) => !value)}
        className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold transition-colors ${
          liked
            ? "border-pink-200 bg-pink-50 text-pink-600"
            : "border-beige bg-white text-gray hover:border-purple hover:text-purple"
        }`}
      >
        <Heart className="h-4 w-4" aria-hidden fill={liked ? "currentColor" : "none"} />
        좋아요 {initialLikes + (liked ? 1 : 0)}
      </button>

      <button
        type="button"
        onClick={() => setSaved((value) => !value)}
        className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold transition-colors ${
          saved
            ? "border-purple bg-purple-light text-purple"
            : "border-beige bg-white text-gray hover:border-purple hover:text-purple"
        }`}
      >
        <Bookmark className="h-4 w-4" aria-hidden fill={saved ? "currentColor" : "none"} />
        {saved ? "저장됨" : "저장"}
      </button>

      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-beige bg-white px-6 py-3 text-sm font-bold text-gray transition-colors hover:border-purple hover:text-purple"
      >
        <Share2 className="h-4 w-4" aria-hidden />
        공유
      </button>
    </div>
  );
}
