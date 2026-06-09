import type {
  CommunityBenefit,
  FaqItem,
  FeatureCard,
  GuideItem,
  LandingNavItem,
  NavLinkItem,
  YarnSwatch,
} from "@/types/landing";

export const MOCK_IS_LOGGED_IN = true;
export const MOCK_USER_NAME = "Frida";

/** Header nav + feature teaser cards — single source of truth */
export const LANDING_NAV_ITEMS: LandingNavItem[] = [
  {
    id: "palette",
    title: "AI 뜨개 도우미",
    href: "#palette",
    description:
      "원하는 작품 사진을 업로드하면 AI가 계절과 분위기에 맞는 실을 추천해드려요.",
    buttonText: "시작하기",
    icon: "palette",
    header: true,
    feature: true,
  },
  {
    id: "gauge",
    title: "손땀 & 게이지 계산기",
    href: "#gauge",
    description:
      "원작 게이지의 코수/단수를 입력하여 나의 뜨개 성향(쫀손/널손)을 분석하고 저장하세요.",
    buttonText: "계산하기",
    icon: "gauge",
    header: true,
    feature: true,
  },
  {
    id: "patterns",
    title: "도안 해설",
    href: "#patterns",
    description: "이해하기 어려운 도안 기호를 쉽고 자세하게 설명해드려요.",
    buttonText: "해설 보기",
    icon: "patterns",
    header: true,
    feature: true,
  },
  {
    id: "preview",
    title: "편물 미리보기",
    href: "#preview",
    description:
      "실 두께와 게이지를 기반으로 완성 후 조직감과 분위기를 미리 확인해보세요.",
    buttonText: "미리보기",
    icon: "layers",
    comingSoon: true,
    feature: true,
  },
  {
    id: "community",
    title: "한코 일기",
    href: "/stitchday",
    description: "오늘 뜬 기록, 게이지 고민, 완성 사진을 함께 나눠요.",
    buttonText: "뜨개 기록 보기",
    icon: "notebook",
    header: true,
  },
  {
    id: "faq",
    title: "FAQ",
    href: "#faq",
    header: true,
  },
];

export const NAV_LINKS: NavLinkItem[] = LANDING_NAV_ITEMS.filter(
  (item) => item.header,
).map((item) => ({
  label: item.title,
  href: item.href,
}));

export const FEATURE_CARDS: FeatureCard[] = LANDING_NAV_ITEMS.filter(
  (
    item,
  ): item is LandingNavItem & {
    feature: true;
    description: string;
    icon: FeatureCard["icon"];
  } => Boolean(item.feature && item.description && item.icon),
).map((item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  buttonText: item.buttonText ?? "자세히 보기",
  icon: item.icon,
  href: item.href,
  comingSoon: item.comingSoon,
}));

export const TODAY_YARN_PALETTE: YarnSwatch[] = [
  { id: "oatmeal", name: "Oatmeal", hex: "#E8DFD0" },
  { id: "lavender", name: "Lavender", hex: "#C4B5FD" },
  { id: "charcoal", name: "Charcoal", hex: "#3D3A45" },
  { id: "deep-plum", name: "Deep Plum", hex: "#4C1D95" },
];

export { COMMUNITY_PREVIEW_POSTS as COMMUNITY_POSTS } from "@/data/posts-mock";

/** Rosaline-style "why choose" points for community section */
export const COMMUNITY_BENEFITS: CommunityBenefit[] = [
  {
    id: "gauge-help",
    title: "게이지·손땀 고민 해결",
    description:
      "쫀손·널손, 코 수 안 맞음 — 비슷한 경험을 한 뜨개인에게 바로 물어보세요.",
    icon: "gauge",
  },
  {
    id: "yarn-inspo",
    title: "실·컬러 영감 나누기",
    description:
      "합사 조합, 완성 사진, 도안 후기를 올리며 다음 작품 아이디어를 얻어요.",
    icon: "sparkles",
  },
  {
    id: "together",
    title: "같은 도안, 함께 뜨기",
    description:
      "진행 상황을 공유하고 응원받으며 혼자 뜨는 막막함을 줄일 수 있어요.",
    icon: "users",
  },
  {
    id: "beginner",
    title: "초보도 편하게",
    description:
      "실수 복구, 기초 질문도 환영. 유튜브 큐레이션과 함께 천천히 배워가요.",
    icon: "message",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 1,
    question: "코 하나 빠졌는데 어떻게 해요?",
    description:
      "실수로 코를 빠뜨렸을 때, 당황하지 않고 되돌리는 가장 좋은 대처법",
    answer:
      "뜨개를 풀지 말고, 빠진 위치 바로 아래 코에 바늘을 넣어 올린 뒤 새 실로 걸어 뜨면 됩니다. \n처음에는 코 대코(count)로 세며 되돌리는 연습을 추천해요. 유튜브에서 '뜨개 코 빠짐 복구' 영상을 함께 보면 더 쉽게 따라할 수 있어요.",
    youtubeUrl: "Ouhi8WUVIro",
  },
  {
    id: 2,
    question: "단수가 자꾸 안 맞아요",
    description:
      "게이지 측정과 단수 조절 팁! 도안과 다르게 나오는 이유와 해결법",
    answer:
      "10cm X 10cm 스워치로 코 수·단 수를 먼저 재보세요.\n도안 게이지와 다르면 바늘 호수를 바꾸거나 손땀을 조절해야 합니다. 쫀손이면 코 수를 늘리고, 널손이면 줄이는 방향으로 조정하면 완성 사이즈가 맞아요.",
    youtubeUrl: "5a-xTQ9rAcI",
  },
  {
    id: 3,
    question: "실이 자꾸 갈라져요",
    description: "실 관리법과 뜨개질 중 갈라짐을 최소화 하는 바늘 잡는 방법",
    answer:
      "실을 너무 당기지 않고, 바늘 끝이 실을 찢지 않게 부드럽게 넣어주세요. \n마모된 바늘은 교체하고, 합사 실은 끝을 살짝 묶어 사용하면 갈라짐이 줄어듭니다. 보관 시 습도 낮은 곳에 두는 것도 도움이 됩니다.",
    youtubeUrl: "w6GN6nomezQ",
  },
];

export const GUIDE_ITEMS: GuideItem[] = [
  {
    id: "tools-and-materials",
    title: "도구와 재료 선택 가이드",
    description: "실, 바늘, 부자재 고르는 방법을 알려드려요.",
    href: "/guide/tools-and-materials",
    icon: "/images/icon3.png",
    iconSizeClass: "h-25 w-25",
  },
  {
    id: "basics",
    title: "뜨개 기초 배우기",
    description: "코 잡기부터 마무리까지 차근차근 배워요.",
    href: "/guide/basics",
    icon: "/images/icon2.png",
    iconSizeClass: "h-35 w-35",
  },
  {
    id: "techniques",
    title: "주요 뜨개 기법",
    description: "기본 기법들을 사진과 영상으로 배워요.",
    href: "/guide/techniques",
    icon: "/images/icon1.png",
    iconSizeClass: "h-30 w-30",
  },
];

export const YARN_PREVIEW_CARDS = [
  { name: "Lavender Purple", hex: "#765997", weight: "DK" },
  { name: "Vintage Move", hex: "#C19BB3", weight: "Worsted" },
  { name: "Soft Oatmeal", hex: "#DCCDBB", weight: "Fingering" },
] as const;
