"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Swiper as SwiperInstance } from "swiper";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { PostListItem } from "@/types/post";
import { CommunityPreviewCard } from "./CommunityPreviewCard";

import "swiper/css";

const SPACE_BETWEEN = 16;

type ContentInsets = {
  before: number;
  after: number;
};

function measureContentInsets(root: HTMLElement | null): ContentInsets | null {
  if (typeof window === "undefined" || !root) return null;

  const section = root.closest("section");
  const container = section?.querySelector<HTMLElement>("[data-site-container]");
  if (!container) return null;

  const rect = container.getBoundingClientRect();
  const style = window.getComputedStyle(container);
  const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(style.paddingRight) || 0;

  return {
    before: Math.max(0, Math.round(rect.left + paddingLeft)),
    after: Math.max(
      0,
      Math.round(window.innerWidth - rect.right + paddingRight),
    ),
  };
}

function isSwiperReady(
  swiper: SwiperInstance | null | undefined,
): swiper is SwiperInstance {
  return Boolean(swiper && swiper.params && !swiper.destroyed);
}

function applyInsets(swiper: SwiperInstance, insets: ContentInsets) {
  if (!isSwiperReady(swiper)) return;

  const { before, after } = insets;

  if (
    swiper.params.slidesOffsetBefore === before &&
    swiper.params.slidesOffsetAfter === after
  ) {
    return;
  }

  swiper.params.slidesOffsetBefore = before;
  swiper.params.slidesOffsetAfter = after;
  swiper.update();
}

type CommunityPreviewSwiperProps = {
  posts: PostListItem[];
};

export function CommunityPreviewSwiper({ posts }: CommunityPreviewSwiperProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [insets, setInsets] = useState<ContentInsets | null>(null);

  const syncLayout = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const measured = measureContentInsets(root);
    if (!measured) return;

    setInsets((prev) => {
      if (
        prev?.before === measured.before &&
        prev?.after === measured.after
      ) {
        return prev;
      }
      return measured;
    });

    const swiper = swiperRef.current;
    if (isSwiperReady(swiper)) {
      applyInsets(swiper, measured);
    }
  }, []);

  const onSwiper = useCallback((swiper: SwiperInstance) => {
    swiperRef.current = swiper;

    requestAnimationFrame(() => {
      const activeSwiper = swiperRef.current;
      if (!isSwiperReady(activeSwiper)) return;

      const measured = measureContentInsets(rootRef.current);
      if (measured) {
        applyInsets(activeSwiper, measured);
      }
    });
  }, []);

  const handleSwiperLayout = useCallback((swiper: SwiperInstance) => {
    if (!isSwiperReady(swiper)) return;

    const measured = measureContentInsets(rootRef.current);
    if (!measured) return;

    setInsets((prev) => {
      if (
        prev?.before === measured.before &&
        prev?.after === measured.after
      ) {
        return prev;
      }
      return measured;
    });
    applyInsets(swiper, measured);
  }, []);

  useLayoutEffect(() => {
    syncLayout();
  }, [syncLayout]);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!isSwiperReady(swiper) || !prevRef.current || !nextRef.current) {
      return;
    }

    if (
      swiper.params.navigation &&
      typeof swiper.params.navigation !== "boolean"
    ) {
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
    }

    swiper.navigation.init();
    swiper.navigation.update();
    syncLayout();
  }, [posts.length, insets, syncLayout]);

  useEffect(() => {
    return () => {
      swiperRef.current = null;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleSync = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(syncLayout, 100);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) scheduleSync();
      },
      { threshold: 0.01 },
    );

    observer.observe(root);
    window.addEventListener("resize", scheduleSync);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      window.removeEventListener("resize", scheduleSync);
    };
  }, [syncLayout]);

  if (posts.length === 0) return null;

  return (
    <div ref={rootRef} className="w-full">
      {insets ? (
        <div
          className="mb-4 flex justify-end gap-2"
          style={{
            paddingLeft: insets.before,
            paddingRight: insets.after,
          }}
        >
          <button
            ref={prevRef}
            type="button"
            aria-label="이전 게시글"
            className="border-beige text-gray hover:border-purple hover:text-purple inline-flex h-10 w-10 items-center justify-center rounded-full border bg-beige-light/80 transition-colors disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            ref={nextRef}
            type="button"
            aria-label="다음 게시글"
            className="border-beige text-gray hover:border-purple hover:text-purple inline-flex h-10 w-10 items-center justify-center rounded-full border bg-beige-light/80 transition-colors disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      ) : (
        <div className="mb-4 min-h-10" aria-hidden />
      )}

      {insets ? (
        <Swiper
          modules={[Navigation]}
          className="community-preview-swiper"
          spaceBetween={SPACE_BETWEEN}
          slidesPerView={1.12}
          slidesPerGroup={1}
          slidesOffsetBefore={insets.before}
          slidesOffsetAfter={insets.after}
          roundLengths
          loop={false}
          watchOverflow
          observer
          observeParents
          breakpoints={{
            768: {
              slidesPerView: 2.12,
              slidesPerGroup: 2,
            },
            1280: {
              slidesPerView: 3.12,
              slidesPerGroup: 3,
            },
          }}
          onSwiper={onSwiper}
          onBreakpoint={handleSwiperLayout}
          onResize={handleSwiperLayout}
        >
          {posts.map((post) => (
            <SwiperSlide key={post.id} className="community-preview-slide">
              <CommunityPreviewCard post={post} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div
          className="community-preview-swiper community-preview-swiper--placeholder"
          aria-hidden
        />
      )}
    </div>
  );
}
