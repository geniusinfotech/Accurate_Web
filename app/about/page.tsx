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
      <main className="overflow-hidden bg-white text-slate-950">
        {/* =========================================================
            HERO
        ========================================================= */}
        <section className="relative">
          {/* Background decoration */}
          <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#e8f7f8] blur-3xl" />
          <div className="pointer-events-none absolute -left-40 top-[40%] h-[400px] w-[400px] rounded-full bg-blue-50 blur-3xl" />

          <div className="wrap relative">
            <div
              className="
                grid
                min-h-[650px]
                items-center
                gap-12
                py-16
                md:grid-cols-2
                md:py-24
                lg:gap-20
              "
            >
              {/* Left */}
              <div>
                <div
                  className="
                    mb-7
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-[#1f4e9e]/10
                    bg-[#e8f7f8]
                    px-4
                    py-2
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-[#1f4e9e]
                  "
                >
                  <Sparkles size={14} />
                  Our story
                </div>

                <h1
                  className="
                    max-w-3xl
                    text-5xl
                    font-black
                    leading-[0.95]
                    tracking-[-0.055em]
                    sm:text-6xl
                    lg:text-7xl
                  "
                >
                  Cleaning that
                  <br />
                  <span className="text-[#1f4e9e]">cares more.</span>
                </h1>

                <p
                  className="
                    mt-7
                    max-w-xl
                    text-base
                    leading-7
                    text-slate-500
                    sm:text-lg
                  "
                >
                  We believe everyday cleaning should do more than remove
                  stains. It should leave your clothes fresh, your home
                  beautiful, and your mind at ease.
                </p>

                <p
                  className="
                    mt-5
                    max-w-xl
                    text-sm
                    leading-6
                    text-slate-400
                  "
                >
                  Born in Varachha, Surat, Accurate and Umiyadham was created
                  with one simple purpose — to bring dependable cleaning
                  performance into everyday homes without making things
                  complicated.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-slate-950
                      px-6
                      py-3.5
                      text-sm
                      font-bold
                      text-white
                      shadow-xl
                      shadow-slate-950/10
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:bg-[#1f4e9e]
                    "
                  >
                    Explore products
                    <ArrowUpRight size={17} />
                  </Link>

                  <Link
                    href="/contact"
                    className="
                      inline-flex
                      items-center
                      rounded-full
                      border
                      border-slate-200
                      bg-white
                      px-6
                      py-3.5
                      text-sm
                      font-bold
                      text-slate-900
                      transition-all
                      duration-300
                      hover:border-slate-950
                    "
                  >
                    Talk to us
                  </Link>
                </div>
              </div>

              {/* Right visual */}
              <div className="relative mx-auto w-full max-w-[520px]">
                <div
                  className="
                    relative
                    aspect-square
                    overflow-hidden
                    rounded-[40px]
                    bg-gradient-to-br
                    from-[#e8f7f8]
                    via-white
                    to-blue-50
                    shadow-[0_30px_100px_rgba(15,23,42,0.10)]
                  "
                >
                  {/* Decorative circles */}
                  <div
                    className="
                      absolute
                      -right-16
                      -top-16
                      h-64
                      w-64
                      rounded-full
                      bg-[#1f4e9e]/10
                    "
                  />

                  <div
                    className="
                      absolute
                      -bottom-20
                      -left-20
                      h-72
                      w-72
                      rounded-full
                      bg-cyan-100/70
                    "
                  />

                  {/* Main liquid visual */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="
                        relative
                        flex
                        h-64
                        w-44
                        items-end
                        justify-center
                        rounded-[35px]
                        bg-gradient-to-br
                        from-white
                        via-slate-50
                        to-slate-200
                        shadow-[20px_30px_60px_rgba(15,23,42,0.18)]
                        sm:h-72
                        sm:w-48
                      "
                    >
                      {/* Cap */}
                      <div
                        className="
                          absolute
                          -top-8
                          h-12
                          w-28
                          rounded-t-2xl
                          rounded-b-lg
                          bg-slate-900
                          shadow-lg
                        "
                      />

                      {/* Bottle label */}
                      <div
                        className="
                          absolute
                          left-5
                          right-5
                          top-24
                          rounded-2xl
                          bg-white
                          px-4
                          py-6
                          text-center
                          shadow-sm
                        "
                      >
                        <Droplets
                          className="mx-auto text-[#1f4e9e]"
                          size={28}
                        />

                        <p className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Accurate
                        </p>

                        <p className="mt-1 text-sm font-black text-slate-950">
                          Washing Liquid
                        </p>

                        <p className="mt-1 text-[8px] font-semibold uppercase tracking-widest text-[#1f4e9e]">
                          Fresh · Clean · Care
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Floating badge */}
                  <div
                    className="
                      absolute
                      bottom-7
                      left-7
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-white/80
                      bg-white/90
                      px-4
                      py-3
                      shadow-xl
                      backdrop-blur
                    "
                  >
                    <div className="grid size-9 place-items-center rounded-full bg-[#e8f7f8] text-[#1f4e9e]">
                      <Sparkles size={16} />
                    </div>

                    <div>
                      <p className="text-xs font-black text-slate-950">
                        Everyday freshness
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Made for modern homes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            BRAND INTRO
        ========================================================= */}
        <section className="border-y border-slate-100 bg-slate-50/70">
          <div className="wrap py-20 md:py-28">
            <div className="mx-auto max-w-4xl text-center">
              <p
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.22em]
                  text-[#1f4e9e]
                "
              >
                Why we started
              </p>

              <h2
                className="
                  mt-5
                  text-3xl
                  font-black
                  leading-tight
                  tracking-[-0.04em]
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                Because clean clothes should feel as good as they look.
              </h2>

              <p
                className="
                  mx-auto
                  mt-6
                  max-w-2xl
                  text-sm
                  leading-7
                  text-slate-500
                  sm:text-base
                "
              >
                Laundry is part of everyday life. We wanted to make that
                everyday ritual simpler with washing liquids that balance
                effective cleaning, pleasant freshness, and thoughtful care.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            VALUES
        ========================================================= */}
        <section>
          <div className="wrap py-20 md:py-28">
            <div className="mb-12 max-w-2xl">
              <p
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-[#1f4e9e]
                "
              >
                <span className="size-1.5 rounded-full bg-[#1f4e9e]" />
                What matters to us
              </p>

              <h2
                className="
                  mt-4
                  text-3xl
                  font-black
                  tracking-[-0.04em]
                  sm:text-4xl
                "
              >
                Simple values.
                <br />
                <span className="text-slate-400">Serious about clean.</span>
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Card 1 */}
              <article
                className="
                  group
                  rounded-[28px]
                  border
                  border-slate-100
                  bg-white
                  p-7
                  shadow-sm
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:shadow-2xl
                  hover:shadow-slate-950/5
                "
              >
                <div
                  className="
                    grid
                    size-12
                    place-items-center
                    rounded-2xl
                    bg-[#e8f7f8]
                    text-[#1f4e9e]
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                >
                  <Droplets size={23} />
                </div>

                <h3 className="mt-7 text-xl font-black tracking-tight">
                  Powerful cleaning
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Formulated to tackle everyday dirt, stains, and odours while
                  giving your clothes the clean finish they deserve.
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#1f4e9e]">
                  <Check size={14} />
                  Made for everyday laundry
                </div>
              </article>

              {/* Card 2 */}
              <article
                className="
                  group
                  rounded-[28px]
                  border
                  border-slate-100
                  bg-white
                  p-7
                  shadow-sm
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:shadow-2xl
                  hover:shadow-slate-950/5
                "
              >
                <div
                  className="
                    grid
                    size-12
                    place-items-center
                    rounded-2xl
                    bg-emerald-50
                    text-emerald-600
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                >
                  <Leaf size={23} />
                </div>

                <h3 className="mt-7 text-xl font-black tracking-tight">
                  Thoughtful formulas
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  We focus on balanced formulations designed around effective
                  cleaning and a pleasant experience for your daily routine.
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <Check size={14} />
                  Thoughtfully developed
                </div>
              </article>

              {/* Card 3 */}
              <article
                className="
                  group
                  rounded-[28px]
                  border
                  border-slate-100
                  bg-white
                  p-7
                  shadow-sm
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:shadow-2xl
                  hover:shadow-slate-950/5
                "
              >
                <div
                  className="
                    grid
                    size-12
                    place-items-center
                    rounded-2xl
                    bg-blue-50
                    text-blue-600
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                >
                  <ShieldCheck size={23} />
                </div>

                <h3 className="mt-7 text-xl font-black tracking-tight">
                  Quality you trust
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Consistency matters. Every product is made with attention to
                  quality so your laundry routine stays dependable.
                </p>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-600">
                  <Check size={14} />
                  Quality-focused production
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* =========================================================
            DIFFERENCE
        ========================================================= */}
        <section className="bg-slate-950 text-white">
          <div className="wrap py-20 md:py-28">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
              <div>
                <p
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-cyan-300
                  "
                >
                  <Sparkles size={14} />
                  The Accurate difference
                </p>

                <h2
                  className="
                    mt-5
                    text-4xl
                    font-black
                    leading-[1]
                    tracking-[-0.05em]
                    sm:text-5xl
                  "
                >
                  Less complexity.
                  <br />
                  More confidence.
                </h2>

                <p className="mt-6 max-w-lg text-sm leading-7 text-slate-400">
                  From the formula to the bottle, we believe good products
                  should be easy to understand, easy to use, and reliable enough
                  to become part of your everyday routine.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
                  <Recycle className="text-cyan-300" size={25} />
                  <h3 className="mt-6 text-lg font-black">
                    Purposeful packaging
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Practical formats designed around how people actually use
                    cleaning products.
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
                  <Heart className="text-cyan-300" size={25} />
                  <h3 className="mt-6 text-lg font-black">Made with care</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Every detail is considered with everyday homes and families
                    in mind.
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
                  <Droplets className="text-cyan-300" size={25} />
                  <h3 className="mt-6 text-lg font-black">Fresh experience</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Cleaning that leaves behind a feeling of freshness, not just
                    a clean surface.
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6">
                  <ShieldCheck className="text-cyan-300" size={25} />
                  <h3 className="mt-6 text-lg font-black">
                    Built on consistency
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Reliable performance you can come back to wash after wash.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            CTA
        ========================================================= */}
        <section>
          <div className="wrap py-20 md:py-28">
            <div
              className="
                relative
                overflow-hidden
                rounded-[32px]
                bg-[#e8f7f8]
                px-6
                py-14
                text-center
                sm:px-10
                md:py-20
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-24
                  size-64
                  rounded-full
                  bg-white/60
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-32
                  -left-20
                  size-72
                  rounded-full
                  bg-[#1f4e9e]/5
                "
              />

              <div className="relative">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-[#1f4e9e] shadow-sm">
                  <Droplets size={25} />
                </div>

                <h2
                  className="
                    mx-auto
                    mt-6
                    max-w-2xl
                    text-3xl
                    font-black
                    tracking-[-0.04em]
                    sm:text-4xl
                  "
                >
                  Bring a better clean into your everyday routine.
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">
                  Discover our washing liquids and find the right everyday clean
                  for your home.
                </p>

                <Link
                  href="/shop"
                  className="
                    mt-8
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-slate-950
                    px-7
                    py-3.5
                    text-sm
                    font-bold
                    text-white
                    shadow-xl
                    shadow-slate-950/10
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#1f4e9e]
                  "
                >
                  Shop washing liquids
                  <ArrowUpRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
