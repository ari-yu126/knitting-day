"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Image as ImageIcon, Lightbulb, X } from "lucide-react";
import { Container } from "@/components/landing/Container";
import { PostCoverPlaceholder } from "@/components/common/PostCoverPlaceholder";
import { POST_CATEGORIES } from "@/data/post-categories";
import { cn } from "@/lib/cn";

const MAX_IMAGES = 8;
const MAX_TAGS = 8;
const MAX_TITLE_LENGTH = 60;

export default function PostWritePage() {
  const router = useRouter();
  const tagFieldId = useId();
  const isComposingTagRef = useRef(false);

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const canSubmit = Boolean(category) && title.trim() !== "" && body.trim() !== "";

  const addImage = () => {
    setImages((prev) =>
      prev.length >= MAX_IMAGES ? prev : [...prev, prev.length],
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

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
      // Ignore Enter while Korean/IME composition is active — otherwise a tag
      // can be added before composition finishes and leave stray syllables (e.g. "노잼" + "잼").
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

  const handleSubmit = () => {
    if (!canSubmit) return;
    router.push("/stitchday");
  };

  return (
    <div>
      <Container className="max-w-3xl">
        <div className="border-base border-b-2 py-9">
          <h1 className="text-2xl font-extrabold tracking-tight text-font sm:text-3xl">
            글쓰기
          </h1>
          <p className="mt-2.5 text-sm text-gray">
            오늘 뜬 기록, 게이지 고민, 완성 사진을 자유롭게 나눠보세요.
          </p>
        </div>

        <div className="border-beige border-b py-6">
          <div className="mb-3.5 flex items-center gap-1.5 text-sm font-bold text-font">
            주제 선택 <span className="text-purple">*</span>
            <span className="ml-auto text-xs font-medium text-gray-light">
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
                      : "border-beige bg-white text-gray hover:border-purple hover:text-purple",
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
          <div className="mb-3.5 flex items-center gap-1.5 text-sm font-bold text-font">
            제목 <span className="text-purple">*</span>
            <span className="ml-auto text-xs font-medium text-gray-light">
              {title.length}/{MAX_TITLE_LENGTH}
            </span>
          </div>
          <input
            type="text"
            maxLength={MAX_TITLE_LENGTH}
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full border-none bg-transparent text-xl font-bold tracking-tight text-font placeholder:text-gray-light/70 focus:outline-none sm:text-2xl"
          />
        </div>

        <div className="border-beige border-b py-6">
          <div className="mb-3.5 flex items-center gap-1.5 text-sm font-bold text-font">
            내용 <span className="text-purple">*</span>
          </div>
          <textarea
            placeholder="실, 바늘, 게이지, 완성 후기까지 — 자세히 적을수록 더 좋은 답을 받을 수 있어요."
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="min-h-72 w-full resize-y border-none bg-transparent text-base leading-relaxed text-font placeholder:text-gray-light/70 focus:outline-none"
          />
        </div>

        <div className="border-beige border-b py-6">
          <div className="mb-3.5 flex items-center gap-1.5 text-sm font-bold text-font">
            사진 첨부
            <span className="ml-auto text-xs font-medium text-gray-light">
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
              "w-full rounded-2xl border-2 border-dashed bg-beige-light/60 px-5 py-9 text-center transition-colors",
              dragOver
                ? "border-purple bg-purple-light"
                : "border-beige hover:border-purple hover:bg-purple-light",
            )}
          >
            <span className="mx-auto mb-3.5 flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-purple shadow-sm">
              <ImageIcon className="h-6 w-6" aria-hidden />
            </span>
            <span className="block text-sm font-bold text-font">
              사진을 끌어다 놓거나 클릭해서 업로드
            </span>
            <span className="mt-1.5 block text-xs text-gray-light">
              JPG, PNG · 최대 {MAX_IMAGES}장 · 완성샷과 게이지 스와치를 함께 올려보세요
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
        </div>

        <div className="border-beige border-b py-6">
          <div className="mb-3.5 flex items-center gap-1.5 text-sm font-bold text-font">
            태그
            <span className="ml-auto text-xs font-medium text-gray-light">
              엔터로 추가 · 최대 {MAX_TAGS}개
            </span>
          </div>
          <div className="focus-within:border-purple focus-within:ring-purple-light flex flex-wrap items-center gap-2 rounded-xl border border-beige px-3 py-2.5 transition-colors focus-within:ring-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-purple-light px-2.5 py-1.5 text-sm font-semibold text-purple"
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
              className="min-w-30 flex-1 border-none bg-transparent py-1 text-sm text-font focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3 rounded-2xl bg-purple-light px-5 py-4.5">
          <Lightbulb className="h-5 w-5 flex-none text-purple" aria-hidden />
          <p className="text-sm leading-relaxed text-purple">
            <b className="font-bold">이렇게 쓰면 더 좋아요!</b>
            <br />
            사용한 실 종류와 바늘 호수, 게이지(10×10cm 기준 코·단)를 적어주시면
            다른 뜨개인들이 따라 뜨기 훨씬 수월해요.
          </p>
        </div>
      </Container>

      <div className="border-beige bg-white/90 sticky bottom-0 z-10 mt-6 border-t backdrop-blur">
        <Container className="max-w-3xl">
          <div className="flex items-center gap-3 py-4">
            <span className="mr-auto text-xs text-gray-light">
              {canSubmit ? "등록할 준비가 됐어요 🧶" : "주제 · 제목 · 내용은 필수예요"}
            </span>
            <Link
              href="/stitchday"
              className="rounded-xl border border-beige bg-white px-5 py-3 text-sm font-bold text-gray transition-colors hover:bg-beige-light"
            >
              취소
            </Link>
            <button
              type="button"
              className="rounded-xl border border-beige bg-white px-5 py-3 text-sm font-bold text-gray transition-colors hover:bg-beige-light"
            >
              임시저장
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="rounded-xl bg-purple px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-purple/90 disabled:cursor-default disabled:bg-beige disabled:text-gray-light"
            >
              등록하기
            </button>
          </div>
        </Container>
      </div>
    </div>
  );
}
