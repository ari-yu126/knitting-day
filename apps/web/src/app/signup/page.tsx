"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { AuthAside, type AuthStep } from "@/features/auth/components/AuthAside";
import { cn } from "@/lib/cn";
import { api, getApiErrorMessage } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 데모용 — 백엔드 중복검사 대체 */
const DEMO_CODE = "123456";
const CODE_LENGTH = 6;

type EmailState = "idle" | "checking" | "ok" | "taken" | "invalid" | "error";

function SectionHeading({
  index,
  done,
  title,
}: {
  index: number;
  done: boolean;
  title: string;
}) {
  return (
    <div className="text-font mb-5 flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
      <span
        className={cn(
          "flex h-7 w-7 flex-none items-center justify-center rounded-full text-sm font-bold transition-colors",
          done ? "bg-emerald-500 text-white" : "bg-purple-light text-purple",
        )}
      >
        {done ? <Check className="h-4 w-4" aria-hidden /> : index}
      </span>
      {title}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const nicknameHintId = useId();

  const [done, setDone] = useState(false);

  // section 1 — email + verification
  const [email, setEmail] = useState("");
  const [emailState, setEmailState] = useState<EmailState>("idle");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [verified, setVerified] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [timer, setTimer] = useState(0);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // section 2 — password
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // section 3 — profile
  const [nickname, setNickname] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // 백엔드 연결 지점: GET /api/auth/check-email?email=... → { available }
  const checkEmail = async () => {
    if (!EMAIL_RE.test(email)) {
      setEmailState("invalid");
      return;
    }
    setEmailState("checking");
    try {
      const res = await api.get(`/auth/check-email?email=${email}`);
      const available = res.data.available;
      if (available) {
        setEmailState("ok");
      } else {
        setEmailState("taken");
      }
    } catch (error) {
      // 서버 오류/네트워크 오류를 "이미 가입된 이메일"로 잘못 표시하지 않도록 별도 상태로 구분
      console.error(error);
      setEmailState("error");
    }
  };

  // 백엔드 연결 지점: POST /api/auth/send-code { email }
  const sendCode = async () => {
    try {
      await api.post(`/auth/send-code`, { email });
      setCodeSent(true);
      setTimer(180);
      setCodeError("");
      setCode(Array(CODE_LENGTH).fill(""));
    } catch (error) {
      console.error(error);
      setCodeError("인증코드 전송에 실패했어요.");
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < CODE_LENGTH - 1) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  // 백엔드 연결 지점: POST /api/auth/verify-code { email, code }
  const codeValue = code.join("");
  const verifyCode = async () => {
    try {
      await api.post(`/auth/verify-code`, {
        email,
        verification_code: codeValue,
      });
      setVerified(true);
      setCodeError("");
    } catch (error) {
      console.error(error);
      setCodeError("인증코드가 일치하지 않아요.");
    }
  };

  const passwordChecks = {
    length: password.length >= 8,
    case: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  const passwordScore = Object.values(passwordChecks).filter(Boolean).length;
  const passwordsMatch =
    passwordConfirm.length > 0 && password === passwordConfirm;
  const passwordsMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm;

  const section1Valid = emailState === "ok" && verified;
  const section2Valid =
    passwordScore >= 3 && passwordChecks.length && passwordsMatch;
  const section3Valid =
    nickname.trim().length >= 2 && agreeTerms && agreePrivacy;
  const allValid = section1Valid && section2Valid && section3Valid;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      if (!allValid) return;

      setSubmitting(true);
      // 백엔드 연결 지점: POST /api/auth/signup { email, password, nickname, marketing }
      await api.post(`/auth/signup`, {
        email,
        password,
        nickname,
        agree_terms: agreeTerms,
        agree_privacy: agreePrivacy,
        agree_marketing: agreeMarketing,
      });
      setSubmitting(false);
      setDone(true);
    } catch (error) {
      console.error(error);
      setSubmitting(false);
      setToast(getApiErrorMessage(error, "회원가입에 실패했어요. 다시 시도해 주세요."));
    }
  };

  const steps: AuthStep[] = [
    { label: "이메일 인증", status: section1Valid ? "done" : "pending" },
    { label: "비밀번호 설정", status: section2Valid ? "done" : "pending" },
    { label: "기본 정보", status: section3Valid ? "done" : "pending" },
  ];

  return (
    <div className="grid h-screen md:grid-cols-2">
      <AuthAside
        heading={
          <>
            뜨개 여정을
            <br />
            시작해볼까요?
          </>
        }
        description="아래 항목만 채우면 나만의 뜨개 일기를 기록할 수 있어요."
        steps={steps}
      />

      <main className="flex items-center-safe justify-center overflow-y-auto px-6 py-14">
        {done ? (
          <div className="w-full max-w-sm text-center">
            <div className="bg-purple-light text-purple mx-auto mb-5.5 flex h-18 w-18 items-center justify-center rounded-full">
              <Check className="h-9 w-9" aria-hidden />
            </div>
            <h1 className="text-font text-2xl font-extrabold tracking-tight">
              가입이 완료됐어요!
            </h1>
            <p className="text-gray mt-3 text-sm leading-relaxed">
              {email} 으로 가입되었습니다.
              <br />
              이제 첫 뜨개 일기를 남겨보세요 🧶
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="bg-purple hover:bg-purple/90 mt-7 w-full rounded-xl py-3.5 text-sm font-bold text-white transition-colors"
            >
              로그인하러 가기
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm">
            <h1 className="text-font text-2xl font-extrabold tracking-tight sm:text-3xl">
              회원가입
            </h1>
            <p className="text-gray mt-2.5 mb-8 text-sm">
              아래 정보를 모두 입력하면 가입이 완료돼요.
            </p>

            {/* 섹션 1: 이메일 인증 */}
            <section>
              <SectionHeading
                index={1}
                done={section1Valid}
                title="이메일 인증"
              />

              <div className="mb-4.5">
                <label
                  htmlFor="email"
                  className="text-font mb-2 block text-sm font-bold"
                >
                  이메일
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    disabled={verified}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailState("idle");
                    }}
                    className={cn(
                      "text-font disabled:bg-beige-light/60 disabled:text-gray w-full rounded-xl border bg-white px-3.5 py-3.5 text-sm transition-colors focus:ring-4 focus:outline-none",
                      emailState === "taken" ||
                        emailState === "invalid" ||
                        emailState === "error"
                        ? "border-pink-400 focus:ring-pink-100"
                        : emailState === "ok"
                          ? "border-emerald-400"
                          : "border-beige focus:border-purple focus:ring-purple-light",
                    )}
                  />
                  <button
                    type="button"
                    onClick={checkEmail}
                    disabled={emailState === "checking" || emailState === "ok"}
                    className="bg-purple-light text-purple hover:bg-purple disabled:bg-beige-light disabled:text-gray-light flex-none rounded-xl px-4 py-3.5 text-sm font-bold transition-colors hover:text-white"
                  >
                    {emailState === "checking"
                      ? "확인중"
                      : emailState === "ok"
                        ? "확인완료"
                        : "중복확인"}
                  </button>
                </div>
                {emailState === "invalid" && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-pink-600">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                    올바른 이메일 형식이 아니에요.
                  </p>
                )}
                {emailState === "taken" && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-pink-600">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                    이미 가입된 이메일이에요.
                  </p>
                )}
                {emailState === "error" && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-pink-600">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                    확인 중 오류가 발생했어요. 다시 시도해 주세요.
                  </p>
                )}
                {emailState === "ok" && !codeSent && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    사용 가능한 이메일이에요!
                  </p>
                )}
              </div>

              {emailState === "ok" && (
                <div className="mb-4.5">
                  <label className="text-font mb-2 block text-sm font-bold">
                    인증코드{" "}
                    {verified && (
                      <span className="text-emerald-600">· 인증완료</span>
                    )}
                  </label>

                  {!codeSent ? (
                    <button
                      type="button"
                      onClick={sendCode}
                      className="bg-purple-light text-purple hover:bg-purple w-full rounded-xl py-3.5 text-center text-sm font-bold transition-colors hover:text-white"
                    >
                      인증코드 받기
                    </button>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        {code.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => {
                              codeInputRefs.current[index] = el;
                            }}
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            disabled={verified}
                            onChange={(event) =>
                              handleCodeChange(index, event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key === "Backspace" &&
                                !code[index] &&
                                index > 0
                              ) {
                                codeInputRefs.current[index - 1]?.focus();
                              }
                            }}
                            className="border-beige text-font focus:border-purple focus:ring-purple-light disabled:bg-beige-light/60 w-full rounded-xl border bg-white py-3 text-center text-lg font-bold tracking-widest focus:ring-4 focus:outline-none"
                          />
                        ))}
                      </div>

                      {!verified && (
                        <div className="text-gray-light mt-2.5 flex items-center justify-between text-xs">
                          <span>
                            {timer > 0
                              ? `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")} 남음`
                              : "코드가 만료됐어요"}
                          </span>
                          <button
                            type="button"
                            onClick={sendCode}
                            disabled={timer > 150}
                            className="text-purple disabled:text-gray-light font-bold"
                          >
                            재전송
                          </button>
                        </div>
                      )}

                      {codeError && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-pink-600">
                          <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                          {codeError}
                        </p>
                      )}
                      {verified && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                          이메일 인증이 완료됐어요!
                        </p>
                      )}
                      {!verified && (
                        <button
                          type="button"
                          onClick={verifyCode}
                          disabled={codeValue.length < CODE_LENGTH}
                          className="bg-purple hover:bg-purple/90 disabled:bg-beige disabled:text-gray-light mt-3 w-full rounded-xl py-3.5 text-center text-sm font-bold text-white transition-colors"
                        >
                          인증 확인
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </section>

            {/* 섹션 2: 비밀번호 설정 */}
            <section className="border-beige mt-6.5 border-t pt-6.5">
              <SectionHeading
                index={2}
                done={section2Valid}
                title="비밀번호 설정"
              />

              <div className="mb-4.5">
                <label
                  htmlFor="password"
                  className="text-font mb-2 block text-sm font-bold"
                >
                  비밀번호
                </label>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="8자 이상, 영문 대소문자·숫자 포함"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="border-beige text-font focus:border-purple focus:ring-purple-light w-full rounded-xl border bg-white py-3.5 pr-11 pl-3.5 text-sm focus:ring-4 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="표시"
                    className="text-gray-light hover:bg-soft-gray hover:text-font absolute right-2.5 flex h-8.5 w-8.5 items-center justify-center rounded-lg transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5" aria-hidden />
                    ) : (
                      <Eye className="h-4.5 w-4.5" aria-hidden />
                    )}
                  </button>
                </div>

                <div className="mt-2.5 flex gap-1.5">
                  {Array.from({ length: 4 }, (_, index) => (
                    <span
                      key={index}
                      className={cn(
                        "bg-beige h-1.5 flex-1 rounded-full transition-colors",
                        index < passwordScore &&
                          (passwordScore <= 1
                            ? "bg-pink-500"
                            : passwordScore === 2
                              ? "bg-amber-500"
                              : passwordScore === 3
                                ? "bg-lime-500"
                                : "bg-emerald-500"),
                      )}
                    />
                  ))}
                </div>

                <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
                  {[
                    { key: "length", label: "8자 이상" },
                    { key: "case", label: "영문 대소문자" },
                    { key: "number", label: "숫자" },
                    { key: "symbol", label: "특수문자" },
                  ].map((req) => {
                    const met =
                      passwordChecks[req.key as keyof typeof passwordChecks];
                    return (
                      <li
                        key={req.key}
                        className={cn(
                          "flex items-center gap-1.5 text-xs",
                          met ? "text-emerald-600" : "text-gray-light",
                        )}
                      >
                        {met ? (
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <Circle className="h-3.5 w-3.5" aria-hidden />
                        )}
                        {req.label}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mb-1">
                <label
                  htmlFor="password-confirm"
                  className="text-font mb-2 block text-sm font-bold"
                >
                  비밀번호 확인
                </label>
                <input
                  id="password-confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="비밀번호를 다시 입력"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  className={cn(
                    "text-font w-full rounded-xl border bg-white px-3.5 py-3.5 text-sm transition-colors focus:ring-4 focus:outline-none",
                    passwordsMismatch
                      ? "border-pink-400 focus:ring-pink-100"
                      : passwordsMatch
                        ? "border-emerald-400"
                        : "border-beige focus:border-purple focus:ring-purple-light",
                  )}
                />
                {passwordsMismatch && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-pink-600">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                    비밀번호가 일치하지 않아요.
                  </p>
                )}
                {passwordsMatch && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    비밀번호가 일치해요!
                  </p>
                )}
              </div>
            </section>

            {/* 섹션 3: 기본 정보 */}
            <section className="border-beige mt-6.5 border-t pt-6.5">
              <SectionHeading
                index={3}
                done={section3Valid}
                title="기본 정보"
              />

              <div className="mb-4.5">
                <label
                  htmlFor="nickname"
                  className="text-font mb-2 block text-sm font-bold"
                >
                  닉네임
                </label>
                <input
                  id="nickname"
                  type="text"
                  maxLength={16}
                  placeholder="뜨개한날에서 사용할 이름"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  aria-describedby={nicknameHintId}
                  className="border-beige text-font focus:border-purple focus:ring-purple-light w-full rounded-xl border bg-white px-3.5 py-3.5 text-sm focus:ring-4 focus:outline-none"
                />
                <p
                  id={nicknameHintId}
                  className="text-gray-light mt-1.5 text-xs"
                >
                  다른 뜨개인들에게 표시되는 이름이에요. (2~16자)
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-gray flex items-start gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(event) => setAgreeTerms(event.target.checked)}
                    className="border-beige text-purple focus:ring-purple-light mt-0.5 h-4 w-4 rounded"
                  />
                  <span>
                    <b className="text-font font-bold">(필수)</b>{" "}
                    <Link
                      href="#"
                      className="text-purple font-semibold underline"
                    >
                      이용약관
                    </Link>
                    에 동의합니다.
                  </span>
                </label>
                <label className="text-gray flex items-start gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(event) => setAgreePrivacy(event.target.checked)}
                    className="border-beige text-purple focus:ring-purple-light mt-0.5 h-4 w-4 rounded"
                  />
                  <span>
                    <b className="text-font font-bold">(필수)</b>{" "}
                    <Link
                      href="#"
                      className="text-purple font-semibold underline"
                    >
                      개인정보 수집·이용
                    </Link>
                    에 동의합니다.
                  </span>
                </label>
                <label className="text-gray flex items-start gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={agreeMarketing}
                    onChange={(event) =>
                      setAgreeMarketing(event.target.checked)
                    }
                    className="border-beige text-purple focus:ring-purple-light mt-0.5 h-4 w-4 rounded"
                  />
                  <span>(선택) 새 도안·이벤트 소식을 메일로 받을게요.</span>
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={!allValid || submitting}
              className="bg-purple hover:bg-purple/90 disabled:bg-beige disabled:text-gray-light mt-7 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-colors disabled:cursor-default"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  가입 중…
                </>
              ) : (
                "가입 완료"
              )}
            </button>
            <p className="text-gray mt-6 text-center text-sm">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/login"
                className="text-purple font-bold hover:underline"
              >
                로그인
              </Link>
            </p>
          </form>
        )}
      </main>

      <div
        className={cn(
          "bg-font fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl px-5.5 py-3.5 text-sm font-semibold text-white shadow-lg transition-all",
          toast
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <AlertCircle className="h-4 w-4" aria-hidden />
        {toast}
      </div>
    </div>
  );
}
