"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

type PostOwnerActionsProps = {
  postId: number;
  postUserId: number;
};

export function PostOwnerActions({
  postId,
  postUserId,
}: PostOwnerActionsProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const myUserId = useAuthStore((state) => state.userId);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOwner = mounted && myUserId != null && Number(myUserId) === Number(postUserId);

  if (!isOwner) return null;

  const handleDelete = async () => {
    const confirmed = window.confirm("이 게시글을 삭제할까요?");
    if (!confirmed) return;

    setDeleting(true);
    setErrorMessage("");
    try {
      await api.delete(`/posts/${postId}`);
      router.push("/stitchday");
    } catch (error) {
      console.error(error);
      setDeleting(false);
      setErrorMessage(
        getApiErrorMessage(error, "게시글 삭제에 실패했어요. 다시 시도해 주세요."),
      );
    }
  };

  return (
    <div className="mb-6 flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => router.push(`/stitchday/${postId}/edit`)}
          className="border-beige text-gray hover:border-purple hover:text-purple inline-flex items-center gap-1.5 rounded-xl border bg-white px-4 py-2 text-sm font-bold transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          수정
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="border-beige text-gray inline-flex items-center gap-1.5 rounded-xl border bg-white px-4 py-2 text-sm font-bold transition-colors hover:border-pink-400 hover:text-pink-600 disabled:cursor-default disabled:opacity-60"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          삭제
        </button>
      </div>
      {errorMessage && (
        <p className="text-sm font-medium text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
