import Link from "next/link";
import { ArrowRight, Globe2, Leaf, ShieldCheck } from "lucide-react";

export function PromiseGrid() {
  return (
    <section className="limewash-section relative overflow-hidden py-20 sm:py-24 lg:py-28 border-t border-slate-200">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Section intro */}
        <div className="mb-12 max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-10 bg-[#244892]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#244892]">
              Our promise
            </span>
          </div>

          <h2 className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-[#0e1117] sm:text-5xl">
            Better choices.{" "}
            <em className="font-serif italic font-normal text-[#244892]">
              Thoughtfully made.
            </em>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* CARD 1 — INGREDIENTS */}
          <div className="group relative min-h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-emerald-50/60 p-7 sm:p-9 lg:col-span-5 lg:p-10 transition-all duration-300 hover:shadow-sm">
            <div className="relative flex h-full flex-col">
              <div className="flex size-11 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm border border-emerald-900/10">
                <Leaf size={20} strokeWidth={1.8} />
              </div>

              <div className="mt-auto pt-8">
                <h3 className="font-serif text-3xl font-normal leading-tight text-[#0e1117]">
                  Kind to your{" "}
                  <em className="font-serif italic font-normal text-emerald-800">
                    kind of clean.
                  </em>
                </h3>

                <p className="mt-4 max-w-sm text-sm leading-6 text-[#244892]">
                  Powerful where it matters. Gentle everywhere else.
                </p>

                <Link
                  href="/about"
                  className="group/link mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0e1117]"
                >
                  Our ingredients
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover/link:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* CARD 2 — QUALITY */}
          <div className="group relative min-h-[360px] overflow-hidden rounded-2xl border border-[#0e1117] bg-[#0e1117] p-7 text-white sm:p-9 lg:col-span-4 lg:p-10 transition-all duration-300 shadow-md">
            <div className="relative flex h-full flex-col">
              <div className="flex size-16 rotate-[-6deg] flex-col items-center justify-center rounded-full border border-white/20 bg-white/10 text-center backdrop-blur-md transition-transform duration-500 group-hover:rotate-0">
                <ShieldCheck size={20} className="text-white" />
                <span className="mt-0.5 text-[7px] font-bold uppercase tracking-widest text-white/80">
                  Verified
                </span>
              </div>

              <div className="mt-auto pt-8">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#df6236]">
                  Verified quality
                </p>

                <h3 className="font-serif text-3xl font-normal leading-tight text-white">
                  Made with{" "}
                  <em className="font-serif italic font-normal text-white/70">
                    intention.
                  </em>
                </h3>

                <Link
                  href="/about"
                  className="group/link mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white"
                >
                  View our promise
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover/link:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* CARD 3 — REUSE */}
          <div className="group relative min-h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/70 p-7 sm:p-9 lg:col-span-3 lg:p-8 transition-all duration-300 hover:shadow-sm">
            <div className="absolute -bottom-8 -right-8 text-[#0e1117]/5 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
              <Globe2 size={160} strokeWidth={0.8} />
            </div>

            <div className="relative flex h-full flex-col">
              <div className="flex size-11 items-center justify-center rounded-xl bg-white text-[#0e1117] shadow-sm border border-slate-200">
                <Globe2 size={20} strokeWidth={1.8} />
              </div>

              <div className="relative mt-auto pt-8">
                <h3 className="font-serif text-2xl font-normal leading-tight text-[#0e1117]">
                  Refill, reuse,{" "}
                  <em className="font-serif italic font-normal text-[#244892]">
                    repeat.
                  </em>
                </h3>

                <span className="mt-3 block max-w-[190px] text-sm leading-6 text-[#244892]">
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
