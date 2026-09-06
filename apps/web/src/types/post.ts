import type { PostCategory } from "@/data/post-categories";

export type { PostCategory };

export type PostListItem = {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  likes: number;
  commentsCount: number;
  category: PostCategory;
  tags: string[];
  /** Post cover image when attached */
  imageUrl?: string;
  /** Landing preview excerpt */
  excerpt?: string;
};

export type PostComment = {
  id: number;
  /** Present when loaded from API — used for ownership checks */
  userId?: number;
  author: string;
  createdAt: string;
  content: string;
};

export type PostDetail = PostListItem & {
  tension: "looser" | "tighter";
  content: string;
  comments: PostComment[];
};

export type PostsPageResult = {
  posts: PostListItem[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
};
