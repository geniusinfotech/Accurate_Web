import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageFrame } from "@/components/storefront";
import { ProductGrid } from "@/components/product/ProductGrid";
import { HomeOffers } from "@/components/home-offers";
import { HomeBanners } from "@/components/home-banners";
import { PromiseGrid } from "@/components/PromiseGrid";

export default function Home() {
  return (
    <PageFrame>
      <main id="top">
        <HomeBanners />
        {/* <section className="hero wrap">
          <div className="hero-copy">
            <h1>
              Pure clean.
              <br />
              <em>Certified</em> quality.
            </h1>
            <p className="hero-intro">
              Thoughtful home care for the spaces you live in. Effective
              formulas, honest ingredients, and a lighter footprint.
            </p>
            <Link className="primary-button" href="/shop">
              Explore products <ArrowRight size={18} />
            </Link>
            <div className="hero-note">
              <ShieldCheck size={18} />
              <span>Quality tested &amp; proudly made in Surat</span>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-stamp">
              <span>
                GOOD FOR
                <br />
                HOME
              </span>
              <Leaf size={28} />
            </div>
            <ProductArt product={fallbackProducts[1]} />
            <div className="hero-caption">
              <span>01 /</span>
              <b>Clean by nature</b>
              <small>Plant-powered, people-approved.</small>
            </div>
          </div>
        </section> */}
        <HomeOffers />

        <PromiseGrid />

        <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-slate-100 blur-3xl" />

          <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-emerald-50 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            {/* =========================================
        SECTION HEADER
    ========================================== */}
            <div className="mb-12 flex flex-col gap-7 sm:mb-14 lg:flex-row lg:items-end lg:justify-between">
              {/* Heading */}
              <div className="max-w-3xl">
                {/* Eyebrow */}
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-10 bg-slate-900" />

                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                    The daily edit
                  </p>
                </div>

                {/* Main heading */}
                <h2 className="text-4xl font-bold leading-[1.04] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Good things
                  <br />
                  <span className="font-serif italic font-medium text-slate-600">
                    for clean spaces.
                  </span>
                </h2>

                {/* Description */}
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                  Thoughtfully selected essentials designed to make everyday
                  cleaning simpler, better, and more enjoyable.
                </p>
              </div>

              {/* =========================================
          SHOP ALL BUTTON
      ========================================== */}
              <Link
                href="/shop"
                className="group inline-flex w-fit shrink-0 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-lg"
              >
                Shop all
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-white transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight size={14} />
                </span>
              </Link>
            </div>

            {/* =========================================
        PRODUCT GRID
    ========================================== */}
            <div className="relative">
              <ProductGrid />
            </div>

            {/* =========================================
        BOTTOM CTA
    ========================================== */}
            <div className="mt-12 flex justify-center sm:mt-14">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
              >
                Explore the complete collection
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight size={16} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="story wrap">
          <div className="story-mark">
            A<span>/</span>U
          </div>
          <div>
            <p className="eyebrow">a little more than clean</p>
            <h2>
              Designed for the
              <br />
              <em>way you live.</em>
            </h2>
            <p>
              We believe a clean home should feel good, not clinical. Accurate
              and Umiyadham are built in Varachha, Surat, with a quiet
              commitment to better formulas and better days.
            </p>
            <Link className="text-link" href="/about">
              Read our story <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
