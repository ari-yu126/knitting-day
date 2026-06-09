import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { YARN_PREVIEW_CARDS } from "@/data/landing-mock";
import { Container } from "./Container";

export function HeroSection() {
  return (
    <section
      aria-label="따뜻한 뜨개 실과 편물 컬러 팔레트"
      className="bg-length:75%_auto relative overflow-hidden bg-[url('/images/hero_banner.png')] bg-center bg-no-repeat py-16 md:py-20 lg:py-50"
    >
      <div
        className="from-oatmeal/90 to-beige-light/0 pointer-events-none absolute inset-0 bg-linear-to-r"
        aria-hidden
      />
      <Container className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-8">
            <div className="flex flex-col gap-6">
              <h1 className="text-font text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl">
                같은 도안도
                <br />
                내 손땀에 맞게
                <br />
                <span className="text-purple inline-block bg-clip-text text-3xl lg:text-4xl">
                  AI 뜨개 플랫폼 &lsquo;뜨개한 날&rsquo;
                </span>
              </h1>
              <p className="text-gray text-lg leading-relaxed">
                손땀 분석부터 실 추천, 도안 해설까지
                <br />
                뜨개질의 모든 고민을 함께 해결해드려요.
              </p>
            </div>
            <Link
              href="/palette"
              className="bg-purple text-oatmeal text-md flex w-fit items-center gap-2 rounded-2xl px-5 py-4 text-lg"
            >
              <Sparkles className="h-4 w-4" />
              AI 뜨개 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="absolute top-[-10%] right-[1%] hidden w-full max-w-56 flex-col gap-2 min-[1000px]:flex">
            {YARN_PREVIEW_CARDS.map((card) => (
              <div
                key={card.name}
                className="bg-oatmeal flex w-full items-center gap-2 rounded-2xl px-4 py-3"
              >
                <span
                  className="h-10 w-10 shrink-0 rounded-full"
                  style={{ backgroundColor: card.hex }}
                />
                <div>
                  <p className="text-font text-sm font-semibold">{card.name}</p>
                  <p className="text-gray text-xs">{card.weight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
