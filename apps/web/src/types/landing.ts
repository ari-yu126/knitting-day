export type YarnSwatch = {
  id: string;
  name: string;
  hex: string;
};

export type FeatureIcon =
  | "gauge"
  | "palette"
  | "layers"
  | "notebook"
  | "patterns";

export type LandingNavItem = {
  id: string;
  title: string;
  href: string;
  description?: string;
  buttonText?: string;
  icon?: FeatureIcon;
  comingSoon?: boolean;
  header?: boolean;
  feature?: boolean;
};

export type NavLinkItem = {
  label: string;
  href?: string;
};

export type FeatureCard = {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  icon: FeatureIcon;
  comingSoon?: boolean;
  href: string;
};

export type CommunityBenefitIcon = "message" | "gauge" | "sparkles" | "users";

export type CommunityBenefit = {
  id: string;
  title: string;
  description: string;
  icon: CommunityBenefitIcon;
};

export type CommunityPost = {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  likes: number;
  commentsCount: number;
  tags: string[];
};

export type FaqItem = {
  id: number;
  question: string;
  description: string;
  answer: string;
  youtubeUrl: string;
  /** Optional override; otherwise fetched from YouTube oEmbed on the server */
  youtubeChannelName?: string;
};

export type GuideItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  /** /images/... 경로 */
  icon: string;
  /** 아이콘 컨테이너에 적용할 Tailwind 사이즈 클래스 (e.g. "h-25 w-25") */
  iconSizeClass: string;
};
