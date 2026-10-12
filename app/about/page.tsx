"use client";

import {
  Droplets,
  Leaf,
  ShieldCheck,
  Sparkles,
  Heart,
  Recycle,
  ArrowUpRight,
  Check,
} from "lucide-react";
import Link from "next/link";
import { PageFrame } from "@/components/storefront";

export default function About() {
  return (
    <PageFrame>
      <main className="overflow-hidden text-[#0e1117]">
        {/* HERO */}
        <section className="relative border-b border-slate-200">
          <div className="wrap relative">
            <div className="grid min-h-[580px] items-center gap-12 py-16 md:grid-cols-2 md:py-24 lg:gap-20">
              {/* Left */}
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <span className="h-px w-10 bg-[#244892]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#244892]">
                    Our story
                  </span>
                </div>

                <h1 className="font-serif text-5xl font-normal leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl text-[#0e1117]">
                  Cleaning that{" "}
                  <em className="font-serif italic font-normal text-[#244892]">
                    cares more.
                  </em>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-7 text-[#244892] sm:text-lg">
                  We believe everyday cleaning should do more than remove
                  stains. It should leave your clothes fresh, your home
                  beautiful, and your mind at ease.
                </p>

                <p className="mt-4 max-w-xl text-sm leading-6 text-[#244892]">
                  Born in Varachha, Surat, Accurate and Umiyadham was created
                  with one simple purpose — to bring dependable cleaning
                  performance into everyday homes without making things
                  complicated.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/shop"
                    className="group inline-flex items-center gap-2 rounded-full bg-[#0e1117] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-[#244892]"
                  >
                    Explore products
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#0e1117] transition-all duration-300 hover:border-[#244892] hover:text-[#244892]"
                  >
                    Talk to us
                  </Link>
                </div>
              </div>

              {/* Right visual */}
              <div className="relative mx-auto w-full max-w-[480px]">
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/70 p-8 shadow-sm">
                  {/* Bottle graphic card */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="relative flex h-64 w-44 items-end justify-center rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <div className="absolute -top-6 h-10 w-24 rounded-t-xl bg-[#0e1117]" />
                      <div className="absolute inset-x-4 top-16 rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
                        <Droplets
                          className="mx-auto text-[#244892]"
                          size={24}
                        />
                        <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#244892]">
                          Accurate
                        </p>
                        <p className="mt-1 font-serif text-sm font-normal text-[#0e1117]">
                          Washing Liquid
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Floating badge */}
                  <div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md">
                    <div className="grid size-8 place-items-center rounded-lg bg-[#edf2fe] text-[#244892]">
                      <Sparkles size={15} />
                    </div>
                    <div>
                      <p className="font-serif text-xs font-normal text-[#0e1117]">
                        Everyday freshness
                      </p>
                      <p className="text-[10px] text-[#244892]">
                        Made for modern homes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BRAND INTRO */}
        <section className="limewash-section border-b border-slate-200">
          <div className="wrap py-20 md:py-24">
            <div className="mx-auto max-w-4xl text-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#244892]">
                Why we started
              </span>

              <h2 className="font-serif mt-4 text-3xl font-normal leading-tight text-[#0e1117] sm:text-4xl lg:text-5xl">
                Because clean clothes should feel as good as they look.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#244892]">
                Laundry is part of everyday life. We wanted to make that
                everyday ritual simpler with washing liquids that balance
                effective cleaning, pleasant freshness, and thoughtful care.
              </p>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="py-20 md:py-28">
          <div className="wrap">
            <div className="mb-12 max-w-2xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-10 bg-[#244892]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#244892]">
                  What matters to us
                </span>
              </div>

              <h2 className="font-serif text-3xl font-normal text-[#0e1117] sm:text-4xl">
                Simple values.{" "}
                <em className="font-serif italic font-normal text-[#244892]">
                  Serious about clean.
                </em>
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Card 1 */}
              <article className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-xs transition-all duration-300 hover:border-[#244892]/40 hover:shadow-sm">
                <div className="grid size-11 place-items-center rounded-xl bg-[#edf2fe] text-[#244892]">
                  <Droplets size={20} />
                </div>
                <h3 className="font-serif mt-6 text-2xl font-normal text-[#0e1117]">
                  Powerful cleaning
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#244892]">
                  Formulated to tackle everyday dirt, stains, and odours while
                  giving your clothes the clean finish they deserve.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#244892]">
                  <Check size={14} />
                  Made for everyday laundry
                </div>
              </article>

              {/* Card 2 */}
              <article className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-xs transition-all duration-300 hover:border-[#244892]/40 hover:shadow-sm">
                <div className="grid size-11 place-items-center rounded-xl bg-[#e8efe9] text-emerald-800">
                  <Leaf size={20} />
                </div>
                <h3 className="font-serif mt-6 text-2xl font-normal text-[#0e1117]">
                  Thoughtful formulas
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#244892]">
                  We focus on balanced formulations designed around effective
                  cleaning and a pleasant experience for your daily routine.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <Check size={14} />
                  Thoughtfully developed
                </div>
              </article>

              {/* Card 3 */}
              <article className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-xs transition-all duration-300 hover:border-[#244892]/40 hover:shadow-sm">
                <div className="grid size-11 place-items-center rounded-xl bg-[#edf2fe] text-[#244892]">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-serif mt-6 text-2xl font-normal text-[#0e1117]">
                  Quality you trust
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#244892]">
                  Consistency matters. Every product is made with attention to
                  quality so your laundry routine stays dependable.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#244892]">
                  <Check size={14} />
                  Quality-focused production
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* DIFFERENCE */}
        <section className="bg-[#0e1117] text-white py-20 md:py-28">
          <div className="wrap">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#009fb5]">
                  The Accurate difference
                </span>

                <h2 className="font-serif mt-4 text-4xl font-normal leading-tight sm:text-5xl">
                  Less complexity.{" "}
                  <em className="font-serif italic font-normal text-white/70">
                    More confidence.
                  </em>
                </h2>

                <p className="mt-6 max-w-lg text-sm leading-7 text-[#244892]">
                  From the formula to the bottle, we believe good products
                  should be easy to understand, easy to use, and reliable enough
                  to become part of your everyday routine.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/15 bg-white/5 p-6">
                  <Recycle className="text-[#009fb5]" size={22} />
                  <h3 className="font-serif mt-4 text-lg font-normal text-white">
                    Purposeful packaging
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#244892]">
                    Practical formats designed around how people actually use
                    cleaning products.
                  </p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/5 p-6">
                  <Heart className="text-[#009fb5]" size={22} />
                  <h3 className="font-serif mt-4 text-lg font-normal text-white">
                    Made with care
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#244892]">
                    Every detail is considered with everyday homes and families
                    in mind.
                  </p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/5 p-6">
                  <Droplets className="text-[#009fb5]" size={22} />
                  <h3 className="font-serif mt-4 text-lg font-normal text-white">
                    Fresh experience
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#244892]">
                    Cleaning that leaves behind a feeling of freshness, not just
                    a clean surface.
                  </p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/5 p-6">
                  <ShieldCheck className="text-[#009fb5]" size={22} />
                  <h3 className="font-serif mt-4 text-lg font-normal text-white">
                    Built on consistency
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#244892]">
                    Reliable performance you can come back to wash after wash.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-24">
          <div className="wrap">
            <div className="limewash-panel relative overflow-hidden rounded-2xl border border-slate-200 px-6 py-14 text-center sm:px-10 md:py-20">
              <div className="relative">
                <div className="mx-auto grid size-12 place-items-center rounded-xl bg-white text-[#244892] border border-slate-200 shadow-xs">
                  <Droplets size={22} />
                </div>

                <h2 className="font-serif mx-auto mt-6 max-w-2xl text-3xl font-normal text-[#0e1117] sm:text-4xl">
                  Bring a better clean into your everyday routine.
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#244892]">
                  Discover our washing liquids and find the right everyday clean
                  for your home.
                </p>

                <Link
                  href="/shop"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#0e1117] px-7 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-[#244892]"
                >
                  Shop washing liquids
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
