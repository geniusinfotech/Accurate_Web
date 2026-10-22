import Link from "next/link";
import { ArrowRight, Droplets, Sparkles } from "lucide-react";
import Image from "next/image";

export function AboutBrand() {
  return (
    <section className="relative overflow-hidden border-t border-slate-200 bg-[#0e1117] text-white">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid min-h-[520px] items-center gap-12 py-20 md:grid-cols-2 md:py-28 lg:gap-20">
          {/* Left — copy */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#df6236]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#df6236]">
                About the brand
              </span>
            </div>

            <h2 className="font-serif text-4xl font-normal leading-[1.08] tracking-tight sm:text-5xl">
              Born in Surat.{" "}
              <em className="font-serif italic font-normal text-[#df6236]">
                Built for every home.
              </em>
            </h2>

            <p className="mt-6 max-w-lg text-sm leading-7 text-white/60">
              Accurate and Umiyadham started with a simple idea in Varachha,
              Surat — that everyday cleaning products should be effective,
              honest, and designed for real life. No complicated claims. Just
              dependable performance that fits naturally into your daily
              routine.
            </p>

            <p className="mt-4 max-w-lg text-sm leading-7 text-white/50">
              From laundry care to household cleaning, our products are
              formulated locally with attention to quality, gentle fragrances,
              and thoughtful packaging.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-[#0e1117]"
              >
                Our story
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#0e1117] transition-all duration-300 hover:bg-[#244892] hover:text-white"
              >
                Shop products
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          {/* Right — visual card */}
          <div className="relative mx-auto w-full max-w-md">
            {/* Main brand visual */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white p-8 backdrop-blur-sm sm:p-10">
              {/* Brand monogram */}
              <div className="mb-8 flex items-center justify-center gap-4">
                <Image src="./logo.png" alt="Logo" width={100} height={100} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-black p-5">
                  <Droplets className="text-white" size={20} />
                  <p className="mt-3 font-serif text-2xl font-normal text-white">
                    6+
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Product lines
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black p-5">
                  <Sparkles className="text-white" size={20} />
                  <p className="mt-3 font-serif text-2xl font-normal text-white">
                    ISO
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
                    Certified quality
                  </p>
                </div>

                <div className="col-span-2 rounded-xl border border-white/10 bg-black p-5">
                  <p className="font-serif text-sm font-normal leading-6 text-white">
                    &ldquo;We believe a clean home should feel good, not
                    clinical. Built with a quiet commitment to better formulas
                    and better days.&rdquo;
                  </p>
                  <p className="mt-3 text-[10px] text-right font-bold uppercase tracking-wider text-white/60">
                    — The Accurate Team
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-[#df6236]/8 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-[#244892]/15 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
