import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageFrame } from "@/components/storefront";
import { ProductGrid } from "@/components/product/ProductGrid";
import { HomeOffers } from "@/components/home-offers";
import { HomeBanners } from "@/components/home-banners";
import { HomeCategories } from "@/components/HomeCategories";
import { PromiseGrid } from "@/components/PromiseGrid";
import { AboutBrand } from "@/components/AboutBrand";
import { WhyChooseAccurate } from "@/components/WhyChooseAccurate";
import { Testimonials } from "@/components/Testimonials";
import { FadeIn } from "@/components/motion/FadeIn";
import Image from "next/image";

export default function Home() {
  return (
    <PageFrame>
      <main id="top">
        <FadeIn>
          <HomeBanners />
        </FadeIn>

        <FadeIn delay={0.2}>
          <HomeOffers />
        </FadeIn>

        {/* Categories — horizontal scrollable strip */}
        <FadeIn delay={0.1}>
          <HomeCategories />
        </FadeIn>

        <FadeIn delay={0.1}>
          <PromiseGrid />
        </FadeIn>

        <section className="limewash-section relative overflow-hidden py-20 sm:py-24 lg:py-28 border-t border-slate-200">
          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            {/* SECTION HEADER */}
            <div className="mb-12 flex flex-col gap-6 sm:mb-14 lg:flex-row lg:items-end lg:justify-between">
              {/* Heading */}
              <div className="max-w-3xl">
                {/* Eyebrow */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px w-10 bg-[#244892]" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#244892]">
                    The daily edit
                  </p>
                </div>

                {/* Main heading */}
                <h2 className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-[#0e1117] sm:text-5xl lg:text-6xl">
                  Good things{" "}
                  <em className="font-serif italic font-normal text-[#244892]">
                    for clean spaces.
                  </em>
                </h2>

                {/* Description */}
                <p className="mt-4 max-w-xl text-base leading-7 text-[#244892] sm:text-lg">
                  Thoughtfully selected essentials designed to make everyday
                  cleaning simpler, better, and more enjoyable.
                </p>
              </div>

              {/* SHOP ALL BUTTON */}
              <Link
                href="/shop"
                className="group inline-flex w-fit shrink-0 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#0e1117] shadow-sm transition-all duration-300 hover:border-[#244892] hover:bg-[#244892] hover:text-white"
              >
                Shop all
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            {/* PRODUCT GRID */}
            <FadeIn delay={0.2} className="relative">
              <ProductGrid />
            </FadeIn>

            {/* BOTTOM CTA */}
            <div className="mt-12 flex justify-center sm:mt-14">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0e1117] transition-colors hover:text-[#244892]"
              >
                Explore the complete collection
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* About the brand — dark section */}
        <FadeIn>
          <AboutBrand />
        </FadeIn>

        {/* Why choose Accurate */}
        <FadeIn>
          <WhyChooseAccurate />
        </FadeIn>

        <FadeIn>
          <section className="story wrap mt-20">
            <div>
              <Image
                src="/logo.png"
                alt="logo"
                width={500}
                height={500}
                className="ml-4 sm:ml-10 max-w-[80%] h-auto"
              />
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
        </FadeIn>

        <FadeIn>
          <Testimonials />
        </FadeIn>
      </main>
    </PageFrame>
  );
}
