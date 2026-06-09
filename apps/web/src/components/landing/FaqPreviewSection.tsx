import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FAQ_ITEMS } from "@/data/landing-mock";
import {
  enrichFaqItemsWithChannelNames,
  getYoutubeThumbnailUrl,
  getYoutubeWatchUrl,
} from "@/lib/youtube";
import { Container } from "./Container";
import { ScrollReveal } from "./ScrollReveal";

export async function FaqPreviewSection() {
  const faqItems = await enrichFaqItemsWithChannelNames(FAQ_ITEMS);

  return (
    <section id="faq" className="scroll-mt-24 py-10 sm:py-14">
      <Container>
        <ScrollReveal className="w-full">
          <div className="mb-12 flex flex-col items-center gap-4">
            <h2 className="text-font text-2xl font-bold sm:text-3xl">
              뜨개 초보라면 여기부터
            </h2>
            <p className="text-gray">
              자주 묻는 질문을 유튜브 가이드로 확인 해보세요
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {faqItems.map((item, index) => {
            const thumbnailUrl = getYoutubeThumbnailUrl(item.youtubeUrl);
            const watchUrl = getYoutubeWatchUrl(item.youtubeUrl);

            return (
              <ScrollReveal
                key={item.id}
                delayMs={index * 100}
                className="w-full"
              >
                <div className="border-beige/80 flex w-full flex-col overflow-hidden rounded-2xl border md:flex-row lg:flex-col">
                  <div className="relative aspect-video w-full shrink-0 md:aspect-auto md:w-96 md:self-stretch lg:aspect-video lg:w-full">
                    <Image
                      src={thumbnailUrl}
                      alt={`${item.question} 유튜브 썸네일`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 384px, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <p className="absolute right-2 bottom-2 rounded-xl bg-black/75 px-2 py-1 text-xs text-white">
                      영상 제공 : {item.youtubeChannelName}
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-5 px-6 py-8">
                    <h3 className="text-font group-data-open:text-purple flex items-center gap-2 font-semibold">
                      <span className="text-oatmeal bg-purple flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                        Q
                      </span>
                      {item.question}
                    </h3>

                    <div className="flex flex-col gap-2 leading-relaxed">
                      <div className="text-gray flex items-center gap-1 text-sm leading-relaxed">
                        <span className="text-purple bg-purple/10 mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                          A
                        </span>
                        <p className="min-w-0">{item.description}</p>
                      </div>
                      <p className="line-clamp-2 pl-10 md:line-clamp-3">
                        {item.answer}
                      </p>
                    </div>
                    <Link
                      href={watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-end gap-2 overflow-hidden"
                      aria-label={`${item.question} — YouTube에서 보기`}
                    >
                      <svg
                        className="h-5 w-5 fill-current"
                        role="img"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      Youtube에서 보기
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
