import Link from "next/link";
import { ArrowRight, Globe2, Leaf, ShieldCheck } from "lucide-react";

export function PromiseGrid() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-cyan-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Section intro */}
        <div className="mb-10 max-w-2xl sm:mb-12">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-10 bg-slate-900" />

            <span className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
              Our promise
            </span>
          </div>

          <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
            Better choices.
            <br />
            <span className="font-serif italic font-medium text-slate-600">
              Thoughtfully made.
            </span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid gap-5 lg:grid-cols-12">
          {/* =====================================
              CARD 1 — INGREDIENTS
          ====================================== */}
          <div className="group relative min-h-[390px] overflow-hidden rounded-[2rem] bg-[#dff7f0] p-7 sm:p-9 lg:col-span-5 lg:p-10">
            {/* Decorative circle */}
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/30 transition-transform duration-700 group-hover:scale-125" />

            <div className="relative flex h-full flex-col">
              {/* Icon */}
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                <Leaf size={19} strokeWidth={2} />
              </div>

              <div className="mt-auto">
                <h2 className="text-3xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-4xl">
                  Kind to your
                  <br />
                  <span className="font-serif italic font-medium text-slate-700">
                    kind of clean.
                  </span>
                </h2>

                <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600 sm:text-base">
                  Powerful where it matters. Gentle everywhere else.
                </p>

                <Link
                  href="/about"
                  className="group/link mt-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-950"
                >
                  Our ingredients
                  <span className="transition-transform duration-300 group-hover/link:translate-x-1">
                    <ArrowRight size={16} />
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* =====================================
              CARD 2 — QUALITY
          ====================================== */}
          <div className="group relative min-h-[390px] overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white sm:p-9 lg:col-span-4 lg:p-10">
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:scale-125" />

            <div className="relative flex h-full flex-col">
              {/* Quality seal */}
              <div className="flex h-20 w-20 rotate-[-8deg] flex-col items-center justify-center rounded-full border border-white/30 bg-white/10 text-center backdrop-blur-md transition-transform duration-500 group-hover:rotate-0">
                <ShieldCheck size={21} />

                <span className="mt-1 text-[7px] font-bold uppercase tracking-[0.18em] text-white/70">
                  Verified
                  <br />
                  Quality
                </span>
              </div>

              <div className="mt-auto">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-white/50">
                  Verified quality
                </p>

                <h2 className="text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl">
                  Made with
                  <br />
                  <span className="font-serif italic font-medium text-white/70">
                    intention.
                  </span>
                </h2>

                <Link
                  href="/about"
                  className="group/link mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white"
                >
                  View our promise
                  <span className="transition-transform duration-300 group-hover/link:translate-x-1">
                    <ArrowRight size={16} />
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* =====================================
              CARD 3 — REUSE
          ====================================== */}
          <div className="group relative min-h-[390px] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-7 sm:p-9 lg:col-span-3 lg:p-8">
            {/* Decorative globe */}
            <div className="absolute -bottom-10 -right-10 text-slate-200 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
              <Globe2 size={180} strokeWidth={0.7} />
            </div>

            <div className="relative flex h-full flex-col">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-sm">
                <Globe2 size={23} />
              </div>

              <div className="relative mt-auto">
                <p className="text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl">
                  Refill, reuse,
                  <br />
                  <strong className="font-bold">repeat.</strong>
                </p>

                <span className="mt-4 block max-w-[190px] text-sm leading-6 text-slate-500">
                  Less plastic. More purpose.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
