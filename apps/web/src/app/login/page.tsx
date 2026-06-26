"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { AuthAside } from "@/features/auth/components/AuthAside";
import { AuthCheckbox } from "@/features/auth/components/AuthCheckbox";
import { cn } from "@/lib/cn";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const emailError =
    touched.email && !EMAIL_RE.test(email)
      ? "올바른 이메일 형식이 아니에요."
      : "";
  const passwordError =
    touched.password && password.length < 8 ? "비밀번호는 8자 이상이에요." : "";
  const valid = EMAIL_RE.test(email) && password.length >= 8;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (!valid) return;

    setLoading(true);
    // 백엔드 연결 지점: POST /api/auth/login { email, password } → { token }
    setTimeout(() => {
      setLoading(false);
      setToast("로그인 성공! 토큰이 발급되었어요 🧶");
      setTimeout(() => router.push("/stitchday"), 900);
    }, 1100);
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <AuthAside
        heading={
          <>
            다시 오신 걸
            <br />
            환영해요.
          </>
        }
        description="오늘 뜬 한 코를 기록하고, 같은 취향의 뜨개인들과 도안과 게이지를 나눠보세요."
        swatches={[
          { color: "#a98fd0", label: "Lavender Purple", weight: "DK" },
          { color: "#b59ab0", label: "Vintage Mauve", weight: "Worsted" },
          { color: "#d8c8ac", label: "Soft Oatmeal", weight: "Fingering" },
        ]}
      />

      <main className="flex items-center justify-center px-6 py-12">
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm">
          <h1 className="text-font text-2xl font-extrabold tracking-tight sm:text-3xl">
            로그인
          </h1>
          <p className="text-gray mt-2.5 mb-8 text-sm">
            이메일과 비밀번호로 로그인하세요.
          </p>

          <div className="mb-4.5">
            <label
              htmlFor="email"
              className="text-font mb-2 block text-sm font-bold"
            >
              이메일
            </label>
            <div className="relative flex items-center">
              <Mail
                className="text-gray-light pointer-events-none absolute left-3.5 h-4.5 w-4.5"
                aria-hidden
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                className={cn(
                  "text-font w-full rounded-xl border bg-white py-3.5 pr-4 pl-10.5 text-sm transition-colors focus:ring-4 focus:outline-none",
                  emailError
                    ? "border-pink-400 focus:ring-pink-100"
                    : "border-beige focus:border-purple focus:ring-purple-light",
                )}
              />
            </div>
            {emailError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-pink-600">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                {emailError}
              </p>
            )}
          </div>

          <div className="mb-4.5">
            <label
              htmlFor="password"
              className="text-font mb-2 block text-sm font-bold"
            >
              비밀번호
            </label>
            <div className="relative flex items-center">
              <Lock
                className="text-gray-light pointer-events-none absolute left-3.5 h-4.5 w-4.5"
                aria-hidden
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, password: true }))
                }
                className={cn(
                  "text-font w-full rounded-xl border bg-white py-3.5 pr-11 pl-10.5 text-sm transition-colors focus:ring-4 focus:outline-none",
                  passwordError
                    ? "border-pink-400 focus:ring-pink-100"
                    : "border-beige focus:border-purple focus:ring-purple-light",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="비밀번호 표시"
                className="text-gray-light hover:bg-soft-gray hover:text-font absolute right-2.5 flex h-8.5 w-8.5 items-center justify-center rounded-lg transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" aria-hidden />
                ) : (
                  <Eye className="h-4.5 w-4.5" aria-hidden />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-pink-600">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                {passwordError}
              </p>
            )}
          </div>

          <div className="mb-6 flex items-center justify-between">
            <AuthCheckbox
              id="remember"
              checked={remember}
              onChange={setRemember}
              label="로그인 상태 유지"
            />
            <Link href="#" className="text-gray-light text-sm hover:underline">
              비밀번호 찾기
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-purple hover:bg-purple/90 disabled:bg-beige disabled:text-gray-light flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-colors disabled:cursor-default"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                로그인 중…
              </>
            ) : (
              "로그인"
            )}
          </button>

          <p className="text-gray mt-7 text-center text-sm">
            아직 계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="text-purple font-bold hover:underline"
            >
              회원가입
            </Link>
          </p>
        </form>
      </main>

      <div
        className={cn(
          "bg-font fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl px-5.5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all",
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        {toast}
      </div>
    </div>
  );
}
