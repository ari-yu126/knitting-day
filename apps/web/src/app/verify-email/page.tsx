import { redirect } from "next/navigation";

// 이메일 인증은 회원가입 폼 안에서 인증코드 입력으로 처리돼서 별도 페이지가 필요 없음.
// 혹시 이 경로로 직접 들어오는 경우(예: 옛날 링크) 빈 화면 대신 회원가입 페이지로 보냄.
export default function VerifyEmailPage() {
  redirect("/signup");
}
