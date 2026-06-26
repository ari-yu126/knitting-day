import type { PostDetail, PostListItem, PostsPageResult } from "@/types/post";
import { POST_CATEGORIES } from "@/data/post-categories";

export const POSTS_PER_PAGE = 6;

/** N일 전 날짜를 반환 (목업 데이터의 작성일 앵커링용) */
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/** 오늘이면 "오늘", 그 외에는 YYYY.MM.DD로 표기 */
function formatPostDate(date: Date): string {
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "오늘";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function createMockPost(id: number): PostDetail {
  return {
    id,
    title: `뜨개 기록 #${id}`,
    author: id % 2 === 0 ? "Frida" : "실뜨는고양이",
    tension: id % 2 === 0 ? "looser" : "tighter",
    createdAt: formatPostDate(daysAgo(id)),
    likes: 10 + (id % 20),
    commentsCount: 0,
    category: POST_CATEGORIES[id % POST_CATEGORIES.length],
    tags: ["#뜨개일기"],
    content: `목업 게시글 ${id}입니다. 페이징 UI 확인용 데이터입니다.`,
    comments: [],
  };
}

const BASE_MOCK_POSTS: PostDetail[] = [
  {
    id: 1,
    title: "블랙베리 아란 가디건 — 3단 떴어요!",
    author: "실뜨는고양이",
    tension: "looser",
    createdAt: formatPostDate(daysAgo(0)),
    likes: 42,
    commentsCount: 2,
    category: "뜨개일기",
    tags: ["#블랙베리아란가디건", "#겨울뜨개"],
    imageUrl: "/images/knit1.png",
    content:
      "도안은 Ravelry에서 구했고, 실은 딥 플럼 + 오트밀 합사로 뜨고 있어요.\n\n어제 밤에 3단까지 떴는데 게이지가 생각보다 쫀쫀해서 내일 바늘 한 호수 올려볼 예정입니다. 같은 도안 뜨시는 분 계시면 게이지 공유해요!",
    comments: [
      {
        id: 1,
        author: "초보뜨개러",
        createdAt: "1시간 전",
        content: "저도 같은 가디건 뜨는 중이에요! 바늘 몇 호 쓰세요?",
      },
      {
        id: 2,
        author: "Frida",
        createdAt: "45분 전",
        content: "합사 실 너무 예뻐요. 완성되면 사진 또 올려주세요!",
      },
    ],
  },
  {
    id: 2,
    title: "처음 뜬 베레모, 게이지가 너무 쫀쫀해요 ㅠ",
    author: "초보뜨개러",
    tension: "looser",
    createdAt: formatPostDate(daysAgo(0)),
    likes: 28,
    commentsCount: 2,
    category: "게이지고민",
    tags: ["#쫀손고민", "#베레모"],
    content:
      "첫 베레모인데 10cm에 24코가 나왔어요. 도안은 22코 기준이라 머리에 안 들어갈 것 같아요.\n\n풀고 다시 떠야 할까요, 아니면 코 수만 늘려서 진행해도 될까요? 조언 부탁드려요.",
    comments: [
      {
        id: 3,
        author: "실뜨는고양이",
        createdAt: "4시간 전",
        content: "스워치 뜰 때보다 본 뜨기가 더 쫀해지는 경우 많아요. 한 호수 키워보세요.",
      },
      {
        id: 4,
        author: "게이지박사",
        createdAt: "3시간 전",
        content: "머리둘레 cm 재서 (머리둘레 × 도안코수) ÷ 도안둘레 로 대략 코 수 계산해보세요.",
      },
    ],
  },
  {
    id: 3,
    title: "오트밀 실로 만든 머플러 컬러 조합 공유",
    author: "Frida",
    tension: "tighter",
    createdAt: formatPostDate(daysAgo(1)),
    likes: 67,
    commentsCount: 1,
    category: "실자랑",
    tags: ["#오트밀", "#머플러", "#컬러팔레트"],
    imageUrl: "/images/knit2.png",
    content:
      "메인은 오트밀, 포인트 한 줄만 라벤더 헤이즈 넣었어요.\n\n2x2 립 끝처리하고 프린지는 짧게 잘랐습니다. 사진보다 실물이 더 부드러운 느낌이에요.",
    comments: [
      {
        id: 5,
        author: "yarnlover",
        createdAt: "어제",
        content: "라벤더 포인트 줄이 분위기 살려주네요. 실 브랜드도 알려주실 수 있나요?",
      },
    ],
  },
  {
    id: 4,
    title: "케이블 스웨터 소매 분리 질문",
    author: "게이지박사",
    tension: "looser",
    createdAt: formatPostDate(daysAgo(1)),
    likes: 19,
    commentsCount: 1,
    category: "질문있어요",
    tags: ["#케이블", "#도안질문"],
    content:
      "도안에 round yoke인데 소매를 따로 떠서 붙이는 방식이에요.\n\n겨드랑이 쪽 코 주울 때 구멍 안 생기게 하는 팁이 있을까요?",
    comments: [
      {
        id: 6,
        author: "Frida",
        createdAt: "12시간 전",
        content: "코 주울 때 한 코 덜 줄이고 다음 단에서 보충하는 방법 써봤어요.",
      },
    ],
  },
  {
    id: 5,
    title: "뜨개방에서 산 실, 게이지가 도안이랑 완전 달라요",
    author: "yarnlover",
    tension: "tighter",
    createdAt: formatPostDate(daysAgo(2)),
    likes: 35,
    commentsCount: 0,
    category: "게이지고민",
    tags: ["#게이지", "#실추천"],
    content:
      "라벨 게이지는 20코인데 제 손땀은 17코… 도안 실을 안 샀더니 이런 일이.\n\n비슷한 두께 다른 브랜드 실 추천해주실 분?",
    comments: [],
  },
  {
    id: 6,
    title: "첫 바라클라바 완성! 사진보다 실물이 나음",
    author: "겨울뜨개",
    tension: "tighter",
    createdAt: formatPostDate(daysAgo(2)),
    likes: 51,
    commentsCount: 1,
    category: "완성샷",
    tags: ["#바라클라바", "#완성"],
    content:
      "charcoal + oatmeal 콤비로 떴습니다. 안감은 fleece 안 넣었는데 두께감 괜찮아요.\n\n귀 쪽만 조금 타이트해서 다음엔 코 4개 늘릴 것 같아요.",
    comments: [
      {
        id: 7,
        author: "실뜨는고양이",
        createdAt: "2일 전",
        content: "색 조합 너무 예뻐요. 도안 링크 공유 가능할까요?",
      },
    ],
  },
  {
    id: 7,
    title: "대바늘 vs 코바늘 게이지 차이",
    author: "초보뜨개러",
    tension: "looser",
    createdAt: formatPostDate(daysAgo(3)),
    likes: 22,
    commentsCount: 0,
    category: "질문있어요",
    tags: ["#대바늘", "#게이지"],
    content:
      "같은 실인데 대바늘이 훨씬 널널하게 나와요. 대바늘로 뜨다가 코바늘 도안 들어가면 항상 헷갈려요.\n\n둘 다 쓰시는 분들 팁 공유해주세요.",
    comments: [],
  },
  {
    id: 8,
    title: "실 정리함 추천해주세요",
    author: "Frida",
    tension: "tighter",
    createdAt: formatPostDate(daysAgo(3)),
    likes: 14,
    commentsCount: 0,
    category: "질문있어요",
    tags: ["#실보관", "#정리"],
    content:
      "합사 실이랑 단색 실이 섞이니까 찾기가 너무 힘들어요.\n\n습도 관리도 되는 보관법이나 수납함 추천 부탁드려요.",
    comments: [],
  },
];

const MOCK_POSTS: PostDetail[] = [
  ...BASE_MOCK_POSTS,
  ...Array.from({ length: 55 }, (_, index) => createMockPost(9 + index)),
];

function toListItem(post: PostDetail): PostListItem {
  const { content: _content, comments: _comments, ...listItem } = post;
  return listItem;
}

export function getAllPostIds(): number[] {
  return MOCK_POSTS.map((post) => post.id);
}

export function getPostById(id: number): PostDetail | undefined {
  return MOCK_POSTS.find((post) => post.id === id);
}

export type PostSortKey = "latest" | "popular" | "comments";

function sortPosts(posts: PostDetail[], sort: PostSortKey): PostDetail[] {
  if (sort === "popular") return [...posts].sort((a, b) => b.likes - a.likes);
  if (sort === "comments")
    return [...posts].sort((a, b) => b.commentsCount - a.commentsCount);
  return posts;
}

export function getPostsPage(
  page: number,
  sort: PostSortKey = "latest",
): PostsPageResult {
  const sorted = sortPosts(MOCK_POSTS, sort);
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const currentPage = Math.min(safePage, totalPages);
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const posts = sorted
    .slice(start, start + POSTS_PER_PAGE)
    .map(toPreviewListItem);

  return {
    posts,
    pagination: {
      page: currentPage,
      totalPages,
      total,
      limit: POSTS_PER_PAGE,
    },
  };
}

function toPreviewListItem(post: PostDetail): PostListItem {
  const plain = post.content.replace(/\s+/g, " ").trim();
  const excerpt =
    plain.length > 72 ? `${plain.slice(0, 72)}…` : plain;

  return {
    ...toListItem(post),
    excerpt,
  };
}

/** Landing section preview (swiper: 3 slides per group on desktop) */
export const COMMUNITY_PREVIEW_POSTS: PostListItem[] = MOCK_POSTS.slice(0, 9).map(
  toPreviewListItem,
);
