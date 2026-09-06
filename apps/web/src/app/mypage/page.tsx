"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, LogOut, Mail, MessageCircle, Pencil } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/landing/Container";
import { useAuthStore } from "@/store/useAuthStore";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/formatDate";

const SCRAP_COUNT = 12;

type MyProfile = {
  nickname: string;
  email: string;
  since: string;
};

type MyPost = {
  id: number;
  category: string;
  title: string;
  createdAt: string;
  likes: number;
  commentsCount: number;
};

export default function MyPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loadError, setLoadError] = useState("");
  const [myPosts, setMyPosts] = useState<MyPost[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      router.push("/login?redirect=/mypage");
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await api.get("/users/me");
        const user = response.data.user;
        setProfile({
          nickname: user.nickname,
          email: user.email,
          since: formatDate(user.created_at),
        });

        // 내가 쓴 글 — 방금 확인한 내 userId로 게시글 목록을 필터링해서 조회
        const postsResponse = await api.get("/posts", {
          params: { userId: user.id },
        });
        setMyPosts(
          postsResponse.data.posts.map((post: any) => ({
            id: post.id,
            category: post.category,
            title: post.title,
            createdAt: formatDate(post.created_at),
            likes: post.like_count,
            commentsCount: post.comment_count,
          })),
        );
      } catch (error) {
        console.error(error);
        setLoadError(
          getApiErrorMessage(error, "내 정보를 불러오지 못했어요."),
        );
      }
    };
    loadProfile();
  }, [mounted, token, router]);

  const totalLikes = myPosts.reduce((sum, post) => sum + post.likes, 0);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!mounted || !token || (!profile && !loadError)) {
    return (
      <div className="text-font flex min-h-screen flex-1 flex-col font-sans">
        <Header />
        <main className="flex-1 py-20 text-center text-sm text-gray-light">
          불러오는 중...
        </main>
        <Footer />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="text-font flex min-h-screen flex-1 flex-col font-sans">
        <Header />
        <main className="flex-1 py-20 text-center text-sm text-red-600">
          {loadError}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="text-font flex min-h-screen flex-1 flex-col font-sans">
      <Header />
      <main className="flex-1">
        <Container>
          <section className="flex items-center gap-5.5 py-12 sm:py-14">
            <div className="flex h-20 w-20 flex-none items-center justify-center rounded-full bg-purple text-3xl font-extrabold text-white shadow-lg sm:h-21 sm:w-21">
              {profile.nickname.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-extrabold tracking-tight text-font sm:text-2xl">
                {profile.nickname}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray">
                <Mail className="h-3.5 w-3.5 text-gray-light" aria-hidden />
                {profile.email}
              </p>
              <p className="mt-0.5 text-xs text-gray-light">가입일 · {profile.since}</p>
            </div>
            <button
              type="button"
              onClick={() => alert("준비중입니다")}
              className="flex flex-none items-center gap-1.5 rounded-xl border border-beige bg-white px-4 py-2.5 text-sm font-bold text-gray transition-colors hover:border-purple hover:text-purple"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              프로필 수정
            </button>
          </section>

          <section className="mb-12 grid grid-cols-3 overflow-hidden rounded-2xl border border-beige">
            <div className="border-r border-beige px-4 py-6 text-center">
              <p className="text-2xl font-extrabold tracking-tight text-purple">
                {myPosts.length}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-gray">작성한 글</p>
            </div>
            <div className="border-r border-beige px-4 py-6 text-center">
              <p className="text-2xl font-extrabold tracking-tight text-purple">
                {totalLikes}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-gray">받은 좋아요</p>
            </div>
            <div className="px-4 py-6 text-center">
              <p className="text-2xl font-extrabold tracking-tight text-purple">
                {SCRAP_COUNT}
              </p>
              <p className="mt-1.5 text-sm font-semibold text-gray">스크랩</p>
            </div>
          </section>

          <section>
            <div className="flex items-baseline justify-between border-b-2 border-base pb-3.5">
              <h2 className="text-lg font-extrabold tracking-tight text-font">내가 쓴 글</h2>
              <button
                type="button"
                onClick={() => alert("준비중입니다")}
                className="text-sm font-semibold text-gray-light transition-colors hover:text-purple"
              >
                전체보기 →
              </button>
            </div>

            {myPosts.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-light">
                아직 작성한 글이 없어요. 첫 뜨개 일기를 남겨보세요 🧶
              </p>
            ) : (
              <ul>
                {myPosts.map((post) => (
                  <li key={post.id} className="border-b border-beige">
                    <button
                      type="button"
                      onClick={() => router.push(`/stitchday/${post.id}`)}
                      className="group flex w-full items-center justify-between gap-5 px-2 py-5 text-left transition-colors hover:bg-beige-light/60"
                    >
                      <div className="min-w-0">
                        {post.category && (
                          <span className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-purple-light px-2.5 py-1 text-xs font-bold text-purple">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple" aria-hidden />
                            {post.category}
                          </span>
                        )}
                        <p className="truncate text-base font-bold text-font group-hover:text-purple">
                          {post.title}
                        </p>
                        <p className="mt-1.5 text-xs text-gray-light">{post.createdAt}</p>
                      </div>
                      <div className="flex flex-none items-center gap-4 text-sm font-semibold text-gray-light">
                        <span className="inline-flex items-center gap-1.5">
                          <Heart className="h-4 w-4" aria-hidden />
                          {post.likes}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MessageCircle className="h-4 w-4" aria-hidden />
                          {post.commentsCount}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="flex justify-center py-12 sm:py-16">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-beige bg-white px-6 py-3 text-sm font-bold text-gray transition-colors hover:border-pink-400 hover:text-pink-600"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              로그아웃
            </button>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
