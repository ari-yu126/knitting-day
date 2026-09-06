"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/formatDate";
import type { PostComment } from "@/types/post";
import { useAuthStore } from "@/store/useAuthStore";

type ApiComment = {
  id: number;
  user_id: number;
  nickname: string;
  created_at: string;
  content: string;
};

type CommentSectionProps = {
  initialComments: PostComment[];
  postId: number;
};

function mapComments(comments: ApiComment[]): PostComment[] {
  return comments.map((comment) => ({
    id: comment.id,
    userId: comment.user_id,
    author: comment.nickname,
    createdAt: formatDate(comment.created_at),
    content: comment.content,
  }));
}

function Comment({
  comment,
  myUserId,
  onDelete,
}: {
  comment: PostComment;
  myUserId: number | null;
  onDelete: (commentId: number) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const isMine =
    myUserId != null &&
    comment.userId != null &&
    Number(comment.userId) === Number(myUserId);

  return (
    <li className="border-beige flex gap-3 border-t py-4 first:border-t-0">
      <div className="bg-purple flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-bold text-white">
        {comment.author.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-gray-light flex items-center gap-2 text-xs">
          <span className="text-font text-sm font-bold">{comment.author}</span>
          <span className="text-gray-light/60">·</span>
          <span>{comment.createdAt}</span>
        </p>
        <p className="text-font mt-1.5 text-sm leading-relaxed">
          {comment.content}
        </p>
        <div className="mt-2 flex gap-4">
          <button
            type="button"
            onClick={() => {
              setLiked((value) => !value);
              setLikes((value) => (liked ? value - 1 : value + 1));
            }}
            className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${
              liked ? "text-pink-600" : "text-gray-light hover:text-purple"
            }`}
          >
            <Heart
              className="h-3.5 w-3.5"
              aria-hidden
              fill={liked ? "currentColor" : "none"}
            />
            {likes}
          </button>
          {isMine && (
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="text-gray-light hover:text-purple text-xs font-semibold transition-colors"
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export function CommentSection({
  initialComments,
  postId,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const token = useAuthStore((state) => state.token);
  const myNickname = useAuthStore((state) => state.nickname);
  const myUserId = useAuthStore((state) => state.userId);
  const isLoggedIn = mounted && Boolean(token);
  const pathname = usePathname();
  const loginHref = `/login?redirect=${encodeURIComponent(pathname)}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  const addComment = async () => {
    if (!isLoggedIn) return;
    if (!draft.trim()) return;

    setErrorMessage("");
    try {
      await api.post(`/posts/${postId}/comments`, {
        content: draft.trim(),
      });
      const data = await api.get(`/posts/${postId}/comments`);
      setComments(mapComments(data.data.comments));
      setDraft("");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        getApiErrorMessage(error, "댓글 등록에 실패했어요. 다시 시도해 주세요."),
      );
    }
  };

  const deleteComment = async (commentId: number) => {
    setErrorMessage("");
    try {
      await api.delete(`/comments/${commentId}`);
      const data = await api.get(`/posts/${postId}/comments`);
      setComments(mapComments(data.data.comments));
    } catch (error) {
      console.error(error);
      setErrorMessage(
        getApiErrorMessage(error, "댓글 삭제에 실패했어요. 다시 시도해 주세요."),
      );
    }
  };

  return (
    <section aria-labelledby="comments-heading">
      <h2
        id="comments-heading"
        className="text-font mb-5 text-lg font-extrabold"
      >
        댓글 <span className="text-purple">{comments.length}</span>
      </h2>

      {isLoggedIn ? (
        <div className="mb-8 flex items-start gap-3">
          <div className="bg-purple flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-bold text-white">
            {myNickname?.slice(0, 1) ?? "나"}
          </div>
          <div className="flex-1">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="따뜻한 댓글을 남겨주세요."
              className="border-beige text-font focus:border-purple focus:ring-purple-light min-h-[3.25rem] w-full resize-y rounded-2xl border bg-white px-4 py-3 text-sm leading-relaxed transition-colors outline-none focus:ring-4"
            />
            {errorMessage && (
              <p className="mt-2 text-sm font-medium text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={addComment}
                disabled={!draft.trim()}
                className="bg-purple hover:bg-purple/90 disabled:bg-beige disabled:text-gray-light rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-colors disabled:cursor-default"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-beige bg-beige-light/40 mb-8 rounded-2xl border border-dashed px-5 py-6 text-center">
          <p className="text-gray text-sm">
            댓글을 작성하려면 로그인이 필요해요.
          </p>
          <Link
            href={loginHref}
            className="text-purple mt-3 inline-block text-sm font-bold hover:underline"
          >
            로그인하러 가기
          </Link>
        </div>
      )}

      {comments.length > 0 ? (
        <ul>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              myUserId={mounted ? myUserId : null}
              onDelete={deleteComment}
            />
          ))}
        </ul>
      ) : (
        <p className="border-beige bg-beige-light/40 text-gray rounded-2xl border border-dashed px-5 py-8 text-center text-sm">
          아직 댓글이 없어요. 첫 댓글을 남겨보세요.
        </p>
      )}
    </section>
  );
}
