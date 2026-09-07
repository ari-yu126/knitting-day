"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Image as ImageIcon, Lightbulb, X } from "lucide-react";
import { Container } from "@/components/landing/Container";
// import { PostCoverPlaceholder } from "@/components/common/PostCoverPlaceholder";
import { POST_CATEGORIES } from "@/data/post-categories";
import { cn } from "@/lib/cn";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

// const MAX_IMAGES = 8;
const MAX_TAGS = 8;
const MAX_TITLE_LENGTH = 60;

export default function PostWritePage() {
  const router = useRouter();
  const tagFieldId = useId();
  const isComposingTagRef = useRef(false);
  const token = useAuthStore((state) => state.token);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.push("/login?redirect=/stitchday/write");
    }
  }, [mounted, token, router]);

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // const [images, setImages] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // const [dragOver, setDragOver] = useState(false);

  const canSubmit =
    Boolean(category) && title.trim() !== "" && content.trim() !== "";

  // const addImage = () => {
  //   setImages((prev) =>
  //     prev.length >= MAX_IMAGES ? prev : [...prev, prev.length],
  //   );
  // };

  // const removeImage = (index: number) => {
  //   setImages((prev) => prev.filter((_, i) => i !== index));
  // };

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
      if (event.nativeEvent.isComposing || isComposingTagRef.current) {
        return;
      }

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
    // 태그 입력창에 글자를 쳐놓고 엔터를 안 누른 채로 등록하면 그 태그가 그냥 사라지던 문제 —
    // 등록 직전에 남아있는 입력값도 태그로 포함시켜서 보냄
    const draftTag = tagDraft.trim().replace(/^#/, "");
    const finalTags =
      draftTag && !tags.includes(draftTag) && tags.length < MAX_TAGS
        ? [...tags, draftTag]
        : tags;
    try {
      await api.post("/posts", {
        title,
        content,
        category,
        tags: finalTags,
      });
      router.push("/stitchday");
    } catch (error) {
      console.error(error);
      setSubmitting(false);
      setSubmitError(
        getApiErrorMessage(error, "게시글 등록에 실패했어요. 다시 시도해 주세요."),
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

  return (
    <div>
      <Container className="max-w-3xl">
        <div className="border-base border-b-2 py-9">
          <h1 className="text-font text-2xl font-extrabold tracking-tight sm:text-3xl">
            글쓰기
          </h1>
          <p className="text-gray mt-2.5 text-sm">
            오늘 뜬 기록, 게이지 고민, 완성 사진을 자유롭게 나눠보세요.
          </p>
        </div>

        <div className="border-beige border-b py-6">
          <div className="text-font mb-3.5 flex items-center gap-1.5 text-sm font-bold">
            주제 선택 <span className="text-purple">*</span>
            <span className="text-gray-light ml-auto text-xs font-medium">
              게시판 카테고리 · 1개 선택
            </span>
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
                      : "border-beige text-gray hover:border-purple hover:text-purple bg-white",
                  )}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" aria-hidden />}
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

        {/* <div className="border-beige border-b py-6">
          <div className="text-font mb-3.5 flex items-center gap-1.5 text-sm font-bold">
            사진 첨부
            <span className="text-gray-light ml-auto text-xs font-medium">
              {images.length}/{MAX_IMAGES}
            </span>
          </div>
          <button
            type="button"
            onClick={addImage}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              addImage();
            }}
            className={cn(
              "bg-beige-light/60 w-full rounded-2xl border-2 border-dashed px-5 py-9 text-center transition-colors",
              dragOver
                ? "border-purple bg-purple-light"
                : "border-beige hover:border-purple hover:bg-purple-light",
            )}
          >
            <span className="text-purple mx-auto mb-3.5 flex h-13 w-13 items-center justify-center rounded-2xl bg-white shadow-sm">
              <ImageIcon className="h-6 w-6" aria-hidden />
            </span>
            <span className="text-font block text-sm font-bold">
              사진을 끌어다 놓거나 클릭해서 업로드
            </span>
            <span className="text-gray-light mt-1.5 block text-xs">
              JPG, PNG · 최대 {MAX_IMAGES}장 · 완성샷과 게이지 스와치를 함께
              올려보세요
            </span>
          </button>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((image, index) => (
                <div
                  key={image}
                  className="relative aspect-square overflow-hidden rounded-xl"
                >
                  <PostCoverPlaceholder
                    ariaLabel={`첨부 이미지 ${index + 1}`}
                    className="h-full w-full"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label="삭제"
                    className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/75"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 z-10 rounded-md bg-black/35 px-1.5 py-0.5 font-mono text-[10px] text-white">
                    IMG {index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div> */}

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
              id={tagFieldId}
              type="text"
              placeholder={tags.length === 0 ? "#라벤더퍼플  #단가라" : ""}
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onCompositionStart={() => {
                isComposingTagRef.current = true;
              }}
              onCompositionEnd={(event) => {
                isComposingTagRef.current = false;
                setTagDraft(event.currentTarget.value);
              }}
              onKeyDown={handleTagKeyDown}
              className="text-font min-w-30 flex-1 border-none bg-transparent py-1 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-purple-light mt-6 flex gap-3 rounded-2xl px-5 py-4.5">
          <Lightbulb className="text-purple h-5 w-5 flex-none" aria-hidden />
          <p className="text-purple text-sm leading-relaxed">
            <b className="font-bold">이렇게 쓰면 더 좋아요!</b>
            <br />
            사용한 실 종류와 바늘 호수, 게이지(10×10cm 기준 코·단)를 적어주시면
            다른 뜨개인들이 따라 뜨기 훨씬 수월해요.
          </p>
        </div>
      </Container>

      <div className="border-beige sticky bottom-0 z-10 mt-6 border-t bg-white/90 backdrop-blur">
        <Container className="max-w-3xl">
          <div className="flex items-center gap-3 py-4">
            <span
              className={cn(
                "mr-auto text-xs",
                submitError ? "font-medium text-red-600" : "text-gray-light",
              )}
            >
              {submitError ||
                (canSubmit
                  ? "등록할 준비가 됐어요 🧶"
                  : "주제 · 제목 · 내용은 필수예요")}
            </span>
            <Link
              href="/stitchday"
              className="border-beige text-gray hover:bg-beige-light rounded-xl border bg-white px-5 py-3 text-sm font-bold transition-colors"
            >
              취소
            </Link>
            <button
              type="button"
              className="border-beige text-gray hover:bg-beige-light rounded-xl border bg-white px-5 py-3 text-sm font-bold transition-colors"
            >
              임시저장
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="bg-purple hover:bg-purple/90 disabled:bg-beige disabled:text-gray-light rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors disabled:cursor-default"
            >
              {submitting ? "등록 중..." : "등록하기"}
            </button>
          </div>
        </Container>
      </div>
    </div>
  );
}
