"use client";

import Link from "next/link";
import { MoveRight } from "lucide-react";
import type { FeatureCard, FeatureIcon } from "@/types/landing";
import { FEATURE_CARDS } from "@/data/landing-mock";
import { Container } from "./Container";
import { ScrollReveal } from "./ScrollReveal";

const FEATURE_ICON_SRC: Record<FeatureIcon, string> = {
  palette: "/images/icon_menu1.svg",
  gauge: "/images/icon_menu2.svg",
  patterns: "/images/icon_menu4.svg",
  layers: "/images/icon_menu3.svg",
  notebook: "/images/icon_menu1.svg",
};

function FeatureMenuIcon({ icon }: { icon: FeatureIcon }) {
  const src = FEATURE_ICON_SRC[icon];

  return (
    <span
      className="feature-menu-icon group-hover:bg-purple-light h-12 w-12 shrink-0 transition-colors"
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
      }}
      aria-hidden
    />
  );
}

function FeatureCardItem({ card }: { card: FeatureCard }) {
  return (
    <article
      id={card.id}
      className="group border-beige/80 bg-oatmeal/30 hover:border-purple/30 relative flex h-full cursor-pointer scroll-mt-24 flex-col gap-10 overflow-hidden rounded-2xl border px-6 py-6 transition-all duration-300 hover:-translate-y-2 lg:px-10 lg:py-10"
    >
      {card.comingSoon && (
        <span className="bg-gray absolute top-4 right-4 rounded-full px-3 py-2 text-xs font-medium text-white">
          Coming Soon
        </span>
      )}
      <span className="bg-purple/10 inline-flex h-17 w-17 items-center justify-center rounded-2xl">
        <FeatureMenuIcon icon={card.icon} />
      </span>
      <div className="flex flex-col gap-4">
        <h3 className="text-font text-xl font-bold">{card.title}</h3>
        <p className="text-gray flex-1 leading-relaxed">{card.description}</p>
      </div>
      <Link
        href={card.href}
        className="inline-flex w-fit items-center gap-2 text-sm font-bold"
      >
        {card.buttonText} <MoveRight strokeWidth={1} />
      </Link>
    </article>
  );
}

export function FeatureTeaserSection() {
  return (
    <section id="features" className="py-10 sm:py-14">
      <Container>
        <ScrollReveal>
          <div className="mb-12 flex max-w-2xl flex-col gap-4">
            <h2 className="text-font text-2xl font-bold sm:text-3xl">
              나에게 딱 맞는 뜨개 경험
            </h2>
            <p className="text-gray">
              실부터 손땀까지, 당신의 뜨개질이 조금 더 쉬워질 수 있도록 AI가
              도와줄게요.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FEATURE_CARDS.map((card, index) => (
            <ScrollReveal key={card.id} delayMs={index * 90} className="h-full">
              <FeatureCardItem card={card} />
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
