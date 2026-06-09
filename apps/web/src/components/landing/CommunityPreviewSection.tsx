import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COMMUNITY_POSTS } from "@/data/landing-mock";
import { CommunityPreviewSwiper } from "./CommunityPreviewSwiper";
import { Container } from "./Container";
import { ScrollReveal } from "./ScrollReveal";

export function CommunityPreviewSection() {
  return (
    <section
      id="community"
      className="bg-beige-light scroll-mt-24 overflow-x-clip bg-linear-to-b py-10 sm:py-14"
    >
      <Container>
        <ScrollReveal>
          <div className="flex flex-row justify-between gap-4">
            <div className="flex flex-col gap-4">
              <h2 className="text-font text-3xl leading-snug font-bold">
                지금 뜨개인들은 무엇을 뜨고 있을까요?
              </h2>
              <p className="text-gray text-sm leading-relaxed sm:text-base">
                실패와 성공, 모든 순간을 함께 나눠요.
              </p>
            </div>
            <Link
              href="/stitchday"
              className="group border-purple/30 text-purple hover:text-beige-light inline-flex w-fit shrink-0 items-center gap-2 self-start px-6 py-3 text-sm font-bold transition-all"
            >
              더 많은 이야기 보러가기
              <ArrowRight className="text-purple h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </ScrollReveal>
      </Container>

      <div className="mt-10 sm:mt-12">
        <CommunityPreviewSwiper posts={COMMUNITY_POSTS} />
      </div>
    </section>
  );
}
