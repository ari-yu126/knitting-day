"use client";

import { useState } from "react";
import { PostCard } from "@/components/posts/PostCard";
import type { PostListItem } from "@/types/post";

type CommunityPostTickerProps = {
  posts: PostListItem[];
};

const SCROLL_KEYFRAMES = "community-scroll-up";

type TickerColumnProps = {
  posts: PostListItem[];
  durationSec: number;
  /** Negative = starts mid-cycle so columns drift apart */
  delaySec?: number;
  offsetClass?: string;
  paused: boolean;
};

function splitIntoColumns(posts: PostListItem[]) {
  const left: PostListItem[] = [];
  const right: PostListItem[] = [];

  posts.forEach((post, index) => {
    if (index % 2 === 0) left.push(post);
    else right.push(post);
  });

  if (left.length === 0) left.push(...posts);
  if (right.length === 0) right.push(...posts);

  const targetLen = Math.max(left.length, right.length);
  const fill = (column: PostListItem[]) => {
    const next = [...column];
    let i = 0;
    while (next.length < targetLen) {
      next.push(posts[i % posts.length]);
      i += 1;
    }
    return next;
  };

  return { left: fill(left), right: fill(right) };
}

function PostRow({ post }: { post: PostListItem }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-beige bg-beige-light/90">
      <PostCard post={post} variant="stack" />
    </div>
  );
}

function TickerColumn({
  posts,
  durationSec,
  delaySec = 0,
  offsetClass = "",
  paused,
}: TickerColumnProps) {
  const loopPosts = [...posts, ...posts];

  return (
    <div className={`min-h-0 flex-1 overflow-hidden ${offsetClass}`}>
      <div
        className="flex flex-col gap-4 will-change-transform"
        style={{
          animation: `${SCROLL_KEYFRAMES} ${durationSec}s linear infinite`,
          animationDelay: `${delaySec}s`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {loopPosts.map((post, index) => (
          <PostRow key={`${post.id}-${index}`} post={post} />
        ))}
      </div>
    </div>
  );
}

export function CommunityPostTicker({ posts }: CommunityPostTickerProps) {
  const { left, right } = splitIntoColumns(posts);
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="relative mx-auto h-[26rem] w-full max-w-5xl px-8 sm:h-[30rem] sm:max-w-6xl sm:px-16 md:px-24 lg:h-[34rem] lg:max-w-7xl lg:px-32"
      aria-label="최신 한코 일기 미리보기"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-linear-to-b from-beige-light via-beige-light/80 to-beige-light/0"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-linear-to-t from-beige-light/80 via-beige-light/40 to-beige-light/0"
      />

      <div className="grid h-full grid-cols-2 gap-2 md:gap-4 lg:gap-6 motion-reduce:hidden">
        <TickerColumn posts={left} durationSec={48} delaySec={0} paused={paused} />
        <TickerColumn
          posts={right}
          durationSec={22}
          delaySec={-9}
          offsetClass="pt-12 sm:pt-16"
          paused={paused}
        />
      </div>

      <ul className="hidden h-full flex-col gap-4 overflow-y-auto px-4 motion-reduce:flex sm:px-8">
        {posts.map((post) => (
          <li key={post.id}>
            <PostRow post={post} />
          </li>
        ))}
      </ul>
    </div>
  );
}
