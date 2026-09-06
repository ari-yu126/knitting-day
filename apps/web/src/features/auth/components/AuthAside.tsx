import { Check } from "lucide-react";
import Link from "next/link";

export type AuthStep = {
  label: string;
  status: "pending" | "active" | "done";
};

export type YarnSwatch = {
  color: string;
  label: string;
  weight: string;
};

type AuthAsideProps = {
  heading: React.ReactNode;
  description: string;
  steps?: AuthStep[];
  swatches?: YarnSwatch[];
};

const KNIT_TEXTURE_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='30' viewBox='0 0 44 30'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='2.4' stroke-linecap='round'%3E%3Cpath d='M2 2 L11 14 L2 26'/%3E%3Cpath d='M20 2 L11 14 L20 26'/%3E%3Cpath d='M24 2 L33 14 L24 26'/%3E%3Cpath d='M42 2 L33 14 L42 26'/%3E%3C/g%3E%3C/svg%3E\")",
  backgroundSize: "22px 15px",
};

export function AuthAside({
  heading,
  description,
  steps,
  swatches,
}: AuthAsideProps) {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,#5d3fa6_0%,#7558bd_48%,#9072cb_100%)] p-12 text-white md:flex lg:p-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-10"
        style={KNIT_TEXTURE_STYLE}
      />

      <Link
        href="/"
        className="relative z-10 flex flex-col leading-none"
      >
        <b className="text-xl font-extrabold tracking-tight">뜨개한 날</b>
        <small className="mt-1 text-[10px] font-bold tracking-[0.24em] text-white/70">
          KNITTING DAY
        </small>
      </Link>

      <div className="relative z-10">
        <h2 className="text-3xl leading-snug font-extrabold tracking-tight text-balance lg:text-4xl">
          {heading}
        </h2>
        <p className="mt-4 max-w-[38ch] text-base leading-relaxed text-white/90">
          {description}
        </p>

        {/* {swatches && (
          <div className="mt-7 flex max-w-[270px] flex-col gap-2.5">
            {swatches.map((swatch) => (
              <div
                key={swatch.label}
                className="flex items-center gap-3 rounded-xl bg-white/94 px-3.5 py-2.5 shadow-lg"
              >
                <span
                  className="h-6.5 w-6.5 flex-none rounded-full"
                  style={{ background: swatch.color }}
                  aria-hidden
                />
                <div>
                  <b className="block text-sm font-bold text-[#2b2630]">
                    {swatch.label}
                  </b>
                  <small className="text-gray-light text-xs">
                    {swatch.weight}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )} */}

        {steps && (
          <div className="mt-7 flex flex-col">
            {steps.map((step) => (
              <div
                key={step.label}
                className={`flex items-center gap-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  step.status === "pending" ? "text-white/60" : "text-white"
                }`}
              >
                <span
                  className={`flex h-6 w-6 flex-none items-center justify-center rounded-full border-[1.6px] text-xs font-bold transition-colors ${
                    step.status === "active"
                      ? "text-purple border-white bg-white"
                      : step.status === "done"
                        ? "border-white/50 bg-white/22 text-white"
                        : "border-white/40 text-white/60"
                  }`}
                >
                  {step.status === "done" ? (
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    steps.indexOf(step) + 1
                  )}
                </span>
                {step.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="relative z-10 text-sm text-white/60">© 2026 Knitting Day</p>
    </aside>
  );
}
