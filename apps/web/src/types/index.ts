export interface User {
  id: number
  email: string
  name: string
}

export interface Post {
  id: number
  title: string
  content: string
  authorId: number
  authorName: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  postId: number
  content: string
  authorId: number
  authorName: string
  createdAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PostsResponse {
  posts: Post[]
  pagination: PaginationMeta
}
