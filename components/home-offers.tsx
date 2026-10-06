"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgePercent, Copy, Check, Sparkles } from "lucide-react";
import { api, getImageUrl } from "@/lib/api";
import type { DealOffer } from "@/lib/types/api";

function isLive(o: DealOffer, now: Date): boolean {
  if (o.isActive === false) return false;
  if (o.validFrom && new Date(o.validFrom) > now) return false;
  if (o.validUntil && new Date(o.validUntil) < now) return false;

  return true;
}

export function HomeOffers() {
  const [offers, setOffers] = useState<DealOffer[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    api
      .get<DealOffer[] | { items: DealOffer[] }>("/deals-offers/active")
      .then((res) => {
        if (!mounted) return;

        const list = Array.isArray(res) ? res : res?.items || [];

        setOffers(list.filter((offer) => isLive(offer, new Date())));
      })
      .catch(() => {
        if (mounted) setOffers([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (offers.length === 0) {
    return null;
  }

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(code);

      setTimeout(() => {
        setCopied((current) => (current === code ? null : current));
      }, 1500);
    } catch {
      // Clipboard unavailable.
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-24 lg:py-28"
      aria-label="Current offers"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* ========================================
            SECTION HEADER
        ========================================= */}
        <div className="mb-12 flex flex-col gap-7 sm:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-slate-900" />

              <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                Limited time
              </p>
            </div>

            <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Offers made
              <br />
              <span className="font-serif italic font-medium text-slate-600">
                for you.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
              Discover exclusive deals and special discounts available for a
              limited time.
            </p>
          </div>

          {/* Shop all */}
          <Link
            href="/shop"
            className="group inline-flex w-fit items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-md"
          >
            Shop the sale
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight size={14} />
            </span>
          </Link>
        </div>

        {/* ========================================
            OFFER GRID
        ========================================= */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => {
            const img = offer.image ? getImageUrl(offer.image) : "";

            const isCopied = copied === offer.couponCode;

            return (
              <article
                key={offer._id || offer.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* ==================================
                    IMAGE
                ================================== */}
                {img ? (
                  <div className="relative h-60 overflow-hidden sm:h-64">
                    <img
                      src={img}
                      alt={offer.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Image overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

                    {/* Discount badge */}
                    <div className="absolute left-5 top-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-lg">
                        <BadgePercent size={15} className="text-red-500" />
                        {offer.discountPercentage ?? 0}% OFF
                      </span>
                    </div>

                    {/* End date */}
                    {offer.validUntil ? (
                      <div className="absolute bottom-5 left-5">
                        <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                          Ends{" "}
                          {new Date(offer.validUntil).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  /* ==================================
                     NO IMAGE FALLBACK
                  ================================== */
                  <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md">
                      <Sparkles size={28} />
                    </div>

                    <div className="absolute left-5 top-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-lg">
                        <BadgePercent size={15} className="text-red-500" />
                        {offer.discountPercentage ?? 0}% OFF
                      </span>
                    </div>
                  </div>
                )}

                {/* ==================================
                    CONTENT
                ================================== */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl font-semibold leading-tight text-slate-950 sm:text-[26px]">
                      {offer.title}
                    </h3>

                    {offer.description ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                        {offer.description}
                      </p>
                    ) : null}
                  </div>

                  {/* ==================================
                      COUPON
                  ================================== */}
                  {offer.couponCode ? (
                    <button
                      type="button"
                      onClick={() => copyCode(offer.couponCode!)}
                      title="Copy coupon code"
                      className="mt-6 flex w-full items-center justify-between gap-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 px-4 py-3.5 text-left transition-colors hover:bg-amber-50"
                    >
                      <div className="min-w-0">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                          Coupon code
                        </p>

                        <span className="block truncate font-mono text-sm font-bold tracking-[0.18em] text-slate-900">
                          {offer.couponCode}
                        </span>
                      </div>

                      <span
                        className={[
                          "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                          isCopied
                            ? "bg-green-100 text-green-700"
                            : "bg-white text-slate-700 shadow-sm",
                        ].join(" ")}
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}

                        {isCopied ? "Copied" : "Copy"}
                      </span>
                    </button>
                  ) : null}

                  {/* ==================================
                      CTA
                  ================================== */}
                  <Link
                    href="/shop"
                    className="group/button mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-800"
                  >
                    Shop now
                    <span className="transition-transform duration-300 group-hover/button:translate-x-1">
                      <ArrowRight size={16} />
                    </span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* ========================================
            MOBILE / BOTTOM LINK
        ========================================= */}
        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"
          >
            View all offers
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
