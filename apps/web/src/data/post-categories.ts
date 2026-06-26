export const POST_CATEGORIES = [
  "뜨개일기",
  "완성샷",
  "게이지고민",
  "도안공유",
  "실자랑",
  "질문있어요",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];
