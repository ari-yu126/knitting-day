"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import type { PostComment } from "@/types/post";

type CommentSectionProps = {
  initialComments: PostComment[];
};

function Comment({ comment }: { comment: PostComment }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  return (
    <li className="flex gap-3 border-t border-beige py-4 first:border-t-0">
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-purple text-sm font-bold text-white">
        {comment.author.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-xs text-gray-light">
          <span className="text-sm font-bold text-font">{comment.author}</span>
          <span className="text-gray-light/60">·</span>
          <span>{comment.createdAt}</span>
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-font">{comment.content}</p>
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
            <Heart className="h-3.5 w-3.5" aria-hidden fill={liked ? "currentColor" : "none"} />
            {likes}
          </button>
          <button
            type="button"
            className="text-xs font-semibold text-gray-light transition-colors hover:text-purple"
          >
            답글
          </button>
        </div>
      </div>
    </li>
  );
}

export function CommentSection({ initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");

  const addComment = () => {
    if (!draft.trim()) return;
    setComments((prev) => [
      {
        id: Date.now(),
        author: "나",
        createdAt: "방금",
        content: draft.trim(),
      },
      ...prev,
    ]);
    setDraft("");
  };

  return (
    <section aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="mb-5 text-lg font-extrabold text-font">
        댓글 <span className="text-purple">{comments.length}</span>
      </h2>

      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-purple text-sm font-bold text-white">
          나
        </div>
        <div className="flex-1">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="따뜻한 댓글을 남겨주세요."
            className="min-h-[3.25rem] w-full resize-y rounded-2xl border border-beige bg-white px-4 py-3 text-sm leading-relaxed text-font outline-none transition-colors focus:border-purple focus:ring-4 focus:ring-purple-light"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={addComment}
              disabled={!draft.trim()}
              className="rounded-xl bg-purple px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-purple/90 disabled:cursor-default disabled:bg-beige disabled:text-gray-light"
            >
              등록
            </button>
          </div>
        </div>
      </div>

      {comments.length > 0 ? (
        <ul>
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-beige bg-beige-light/40 px-5 py-8 text-center text-sm text-gray">
          아직 댓글이 없어요. 첫 댓글을 남겨보세요.
        </p>
      )}
    </section>
  );
}
