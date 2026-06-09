import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GUIDE_ITEMS } from "@/data/landing-mock";
import { Container } from "./Container";
import { ScrollReveal } from "./ScrollReveal";

export function GuidePreviewSection() {
  return (
    <section id="guide" className="scroll-mt-24 py-10 sm:py-14">
      <Container>
        <div className="bg-oatmeal flex flex-col gap-4 rounded-2xl px-10 py-10">
          <ScrollReveal className="w-full">
            <div className="mb-7 flex flex-col gap-4">
              <h2 className="text-font text-2xl font-bold sm:text-3xl">
                단계별로 배우는 뜨개 가이드
              </h2>
              <p className="text-gray">
                처음 뜨개를 시작하는 분들을 위한 가이드
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal className="grid grid-cols-1 items-start gap-8 sm:gap-10 md:grid-cols-3 lg:gap-20">
            {GUIDE_ITEMS.map((item) => (
              <div
                key={item.id}
                className="relative flex h-30 flex-col gap-6 md:h-50"
              >
                <div
                  className={`absolute right-0 bottom-0 ${item.iconSizeClass} flex items-center justify-center opacity-50`}
                >
                  <img src={item.icon} alt={item.title} className="w-full" />
                </div>
                <div className="relative flex flex-col gap-3">
                  <h3 className="text-font text-xl font-bold">{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <Link
                  href={item.href}
                  className="text-purple flex items-center gap-2"
                >
                  보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
