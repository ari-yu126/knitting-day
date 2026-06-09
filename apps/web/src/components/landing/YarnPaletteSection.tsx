"use client";

import { TODAY_YARN_PALETTE } from "@/data/landing-mock";
import { Container } from "./Container";

export function YarnPaletteSection() {
  return (
    <section id="palette" className="bg-beige-light py-10 sm:py-14">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="text-font text-2xl font-bold sm:text-3xl">
            오늘의 실 팔레트
          </h2>
          <p className="text-gray">오늘 뜨개한 날이 추천하는 컬러 조합</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {TODAY_YARN_PALETTE.map((swatch) => (
            <article
              key={swatch.id}
              className="group border-beige/80 bg-beige-light/50 hover:border-purple/30 flex flex-col items-center gap-4 rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-2"
            >
              <span
                className="ring-beige-light h-20 w-20 rounded-full ring-4 transition-transform duration-300 group-hover:scale-110 sm:h-24 sm:w-24"
                style={{ backgroundColor: swatch.hex }}
              />
              <span className="text-font text-sm font-semibold">
                {swatch.name}
              </span>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
