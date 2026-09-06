"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { X } from "lucide-react";
import { Container } from "@/components/landing/Container";
import { POST_CATEGORIES } from "@/data/post-categories";
import { cn } from "@/lib/cn";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const MAX_TAGS = 8;
const MAX_TITLE_LENGTH = 60;

export default function PostEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const postId = params.id;
  const myUserId = useAuthStore((state) => state.userId);
  const token = useAuthStore((state) => state.token);
  const [mounted, setMounted] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isOwner, setIsOwner] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 비로그인 상태로 URL을 직접 눌러서 들어온 경우 대비 — 글쓰기 페이지와 동일한 로그인 가드
  useEffect(() => {
    if (mounted && !token) {
      router.push(`/login?redirect=/stitchday/${postId}/edit`);
    }
  }, [mounted, token, postId, router]);

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");

  useEffect(() => {
    const loadPost = async () => {
      try {
        const response = await api.get(`/posts/${postId}`);
        const post = response.data.post;

        if (myUserId != null && Number(post.user_id) !== Number(myUserId)) {
          setIsOwner(false);
          return;
        }

        setCategory(post.category);
        setTitle(post.title);
        setContent(post.content);
        setTags(post.tags ?? []);
      } catch (error) {
        console.error(error);
        setLoadError(
          getApiErrorMessage(error, "게시글을 불러오지 못했어요."),
        );
      } finally {
        setLoading(false);
      }
    };
    loadPost();
    // myUserId는 로그인 상태가 바뀔 때만 다시 확인하면 되므로 postId 변경 시에만 재실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const canSubmit =
    Boolean(category) && title.trim() !== "" && content.trim() !== "";

  const addTag = () => {
    const next = tagDraft.trim().replace(/^#/, "");
    if (next && !tags.includes(next) && tags.length < MAX_TAGS) {
      setTags((prev) => [...prev, next]);
    }
    setTagDraft("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (event.nativeEvent.isComposing) return;
      event.preventDefault();
      addTag();
      return;
    }
    if (event.key === "Backspace" && !tagDraft && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.put(`/posts/${postId}`, {
        title,
        content,
        category,
        tags,
      });
      router.push(`/stitchday/${postId}`);
    } catch (error) {
      console.error(error);
      setSubmitting(false);
      setSubmitError(
        getApiErrorMessage(error, "게시글 수정에 실패했어요. 다시 시도해 주세요."),
      );
    }
  };

  if (!mounted || !token) {
    return (
      <div className="py-20 text-center text-sm text-gray-light">
        로그인이 필요해요. 로그인 페이지로 이동 중...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-gray-light">
        불러오는 중...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-20 text-center text-sm text-red-600">
        {loadError}
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="py-20 text-center text-sm text-red-600">
        본인이 작성한 게시글만 수정할 수 있어요.
      </div>
    );
  }

  return (
    <div>
      <Container className="max-w-3xl">
        <div className="border-base border-b-2 py-9">
          <h1 className="text-font text-2xl font-extrabold tracking-tight sm:text-3xl">
            게시글 수정
          </h1>
        </div>

        <div className="border-beige border-b py-6">
          <div className="text-font mb-3.5 flex items-center gap-1.5 text-sm font-bold">
            주제 선택 <span className="text-purple">*</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {POST_CATEGORIES.map((option) => {
              const isSelected = option === category;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCategory(option)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-3.5 text-sm font-semibold transition-colors",
                    isSelected
                      ? "border-purple bg-purple-light text-purple"
                      : "border-beige bg-white text-gray hover:border-purple hover:text-purple",
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-beige border-b py-6">
          <div className="text-font mb-3.5 flex items-center gap-1.5 text-sm font-bold">
            제목 <span className="text-purple">*</span>
            <span className="text-gray-light ml-auto text-xs font-medium">
              {title.length}/{MAX_TITLE_LENGTH}
            </span>
          </div>
          <input
            type="text"
            maxLength={MAX_TITLE_LENGTH}
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="text-font placeholder:text-gray-light/70 w-full border-none bg-transparent text-xl font-bold tracking-tight focus:outline-none sm:text-2xl"
          />
        </div>

        <div className="border-beige border-b py-6">
          <div className="text-font mb-3.5 flex items-center gap-1.5 text-sm font-bold">
            내용 <span className="text-purple">*</span>
          </div>
          <textarea
            placeholder="실, 바늘, 게이지, 완성 후기까지 — 자세히 적을수록 더 좋은 답을 받을 수 있어요."
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="text-font placeholder:text-gray-light/70 min-h-72 w-full resize-y border-none bg-transparent text-base leading-relaxed focus:outline-none"
          />
        </div>

        <div className="border-beige border-b py-6">
          <div className="text-font mb-3.5 flex items-center gap-1.5 text-sm font-bold">
            태그
            <span className="text-gray-light ml-auto text-xs font-medium">
              엔터로 추가 · 최대 {MAX_TAGS}개
            </span>
          </div>
          <div className="focus-within:border-purple focus-within:ring-purple-light border-beige flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors focus-within:ring-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-purple-light text-purple inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label="삭제"
                  className="opacity-70 hover:opacity-100"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={tags.length === 0 ? "#라벤더퍼플  #단가라" : ""}
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={handleTagKeyDown}
              className="text-font min-w-30 flex-1 border-none bg-transparent py-1 text-sm focus:outline-none"
            />
          </div>
        </div>

        {submitError && (
          <p className="mt-4 text-sm font-medium text-red-600" role="alert">
            {submitError}
          </p>
        )}
      </Container>

      <div className="border-beige sticky bottom-0 z-10 mt-6 border-t bg-white/90 backdrop-blur">
        <Container className="max-w-3xl">
          <div className="flex items-center justify-end gap-3 py-4">
            <button
              type="button"
              onClick={() => router.push(`/stitchday/${postId}`)}
              className="border-beige text-gray hover:bg-beige-light rounded-xl border bg-white px-5 py-3 text-sm font-bold transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="bg-purple hover:bg-purple/90 disabled:bg-beige disabled:text-gray-light rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors disabled:cursor-default"
            >
              {submitting ? "수정 중..." : "수정 완료"}
            </button>
          </div>
        </Container>
      </div>
    </div>
  );
}
