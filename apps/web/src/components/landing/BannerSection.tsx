import Link from "next/link";
import { Container } from "./Container";
import { ScrollReveal } from "./ScrollReveal";

export function BannerSection() {
  return (
    <section id="banner" className="mt-17 scroll-mt-24">
      <Container>
        <div className="bg-purple-light/30 relative rounded-3xl bg-linear-to-b px-13 py-10">
          <div
            className="pointer-events-none absolute right-[-3%] bottom-0 w-auto"
            aria-hidden
          >
            <img
              src="/images/img_banner.png"
              alt=""
              className="h-[200px] w-auto md:h-[300px]"
            />
          </div>
          <div className="relative z-10">
            <ScrollReveal>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <h2 className="text-font text-2xl font-bold sm:text-3xl">
                    처음이라면 여기부터 확인하세요!
                  </h2>
                  <p className="text-gray">
                    뜨개한 날이 당신의 뜨개를 응원합니다 💜
                  </p>
                </div>
                <Link
                  href="/stitchday"
                  className="bg-purple-light text-purple flex w-fit shrink-0 items-center gap-2 self-start rounded-2xl px-6 py-3 text-sm font-bold transition-all"
                >
                  유용한 링크 모아보기
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
