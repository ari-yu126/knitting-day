"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

type PostActionsProps = {
  postId: number;
  initialLikes: number;
};

export function PostActions({ postId, initialLikes }: PostActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleLike = async () => {
    // 비로그인 상태면 좋아요 대신 로그인 페이지로 (돌아올 위치를 redirect로 전달)
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    const nextLiked = !liked;
    try {
      const response = nextLiked
        ? await api.post(`/posts/${postId}/like`)
        : await api.delete(`/posts/${postId}/like`);
      setLiked(nextLiked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 py-9">
      <button
        type="button"
        onClick={toggleLike}
        disabled={submitting}
        className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold transition-colors ${
          liked
            ? "border-pink-200 bg-pink-50 text-pink-600"
            : "border-beige bg-white text-gray hover:border-purple hover:text-purple"
        }`}
      >
        <Heart className="h-4 w-4" aria-hidden fill={liked ? "currentColor" : "none"} />
        좋아요 {likeCount}
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
