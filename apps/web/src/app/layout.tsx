import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "@/styles/tailwind.css";
import "@/styles/global.scss";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "뜨개한 날 | Knitting Day",
  description:
    "실은 샀는데 뭘 떠야 할지 모르겠다면 — 손땀 분석, AI 실 팔레트, 뜨개 커뮤니티까지 한곳에서.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKR.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        {children}
      </body>
    </html>
  );
}
