"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Copy,
  Check,
  Sparkles,
  Tag,
  Clock3,
} from "lucide-react";
import { api, getImageUrl } from "@/lib/api";
import type { DealOffer } from "@/lib/types/api";

function isLive(o: DealOffer, now: Date): boolean {
  if (o.isActive === false) return false;
  if (o.validFrom && new Date(o.validFrom) > now) return false;
  if (o.validUntil && new Date(o.validUntil) < now) return false;

  return true;
}

const DEFAULT_OFFERS: DealOffer[] = [
  {
    _id: "default-offer-1",
    id: "default-offer-1",
    title: "Special Inaugural Offer",
    description:
      "Enjoy 15% flat discount on your daily cleaning essentials with quick dispatch across India.",
    couponCode: "CLEAN15",
    discountPercentage: 15,
    validFrom: "2026-01-01T00:00:00.000Z",
    validUntil: "2027-01-01T00:00:00.000Z",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export function HomeOffers() {
  const [offers, setOffers] = useState<DealOffer[]>(DEFAULT_OFFERS);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    api
      .get<DealOffer[] | { items: DealOffer[] }>("/deals-offers/active")
      .then((res) => {
        if (!mounted) return;

        const list = Array.isArray(res) ? res : res?.items || [];
        const live = list.filter((offer) => isLive(offer, new Date()));

        setOffers(live.length > 0 ? live : DEFAULT_OFFERS);
      })
      .catch(() => {
        if (mounted) setOffers(DEFAULT_OFFERS);
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
      className="limewash-section relative overflow-hidden py-20 sm:py-24 lg:py-28"
      aria-label="Current offers"
    >
      {/* Background Subtle Warm Blur */}
      <div className="pointer-events-none absolute -left-48 top-20 h-[420px] w-[420px] rounded-full bg-[#244892]/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-48 top-0 h-[450px] w-[450px] rounded-full bg-[#da3f51]/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* HEADER */}
        <div className="mb-12 lg:mb-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              {/* Eyebrow */}
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-10 bg-[#244892]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#244892]">
                  Special offers
                </span>
              </div>

              <h2 className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-[#0e1117] sm:text-5xl">
                Better Clean.{" "}
                <em className="font-serif italic font-normal text-[#244892]">
                  Better Value.
                </em>
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-[#244892] sm:text-lg">
                Fresh offers on your everyday washing essentials. Grab your
                favourite products while these deals last.
              </p>
            </div>

            {/* Desktop shop button */}
            <Link
              href="/shop"
              className="group inline-flex w-fit items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#0e1117] shadow-sm transition-all duration-300 hover:border-[#244892] hover:bg-[#244892] hover:text-white lg:mb-1"
            >
              View all products
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* OFFER GRID */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => {
            const img = offer.image ? getImageUrl(offer.image) : "";
            const isCopied = copied === offer.couponCode;

            return (
              <article
                key={offer._id || offer.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#244892]/40 hover:shadow-md"
              >
                {/* IMAGE */}
                {img ? (
                  <div className="relative h-60 overflow-hidden sm:h-64">
                    <img
                      src={img}
                      alt={offer.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1117]/60 via-transparent to-transparent" />

                    {/* Discount */}
                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#da3f51] shadow-sm">
                        <BadgePercent size={14} />
                        {offer.discountPercentage ?? 0}% OFF
                      </span>
                    </div>

                    {/* End date */}
                    {offer.validUntil ? (
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#0e1117]/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                          <Clock3 size={13} />
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
                  /* NO IMAGE FALLBACK */
                  <div className="relative flex h-56 items-center justify-center overflow-hidden bg-slate-100">
                    <div className="relative grid size-16 place-items-center rounded-2xl border border-slate-200 bg-white text-[#244892] shadow-sm">
                      <Sparkles size={24} />
                    </div>

                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#da3f51] shadow-sm">
                        <BadgePercent size={14} />
                        {offer.discountPercentage ?? 0}% OFF
                      </span>
                    </div>
                  </div>
                )}

                {/* CONTENT */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-[#244892]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#244892]">
                        Limited offer
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-normal leading-tight text-[#0e1117]">
                      {offer.title}
                    </h3>

                    {offer.description ? (
                      <p className="mt-2.5 line-clamp-3 text-sm leading-6 text-[#244892]">
                        {offer.description}
                      </p>
                    ) : null}
                  </div>

                  {/* COUPON */}
                  {offer.couponCode ? (
                    <button
                      type="button"
                      onClick={() => copyCode(offer.couponCode!)}
                      title="Copy coupon code"
                      className="mt-6 flex w-full items-center justify-between gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:border-[#244892] hover:bg-white"
                    >
                      <div className="min-w-0">
                        <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#244892]">
                          Coupon code
                        </p>
                        <span className="block truncate font-mono text-xs font-bold tracking-widest text-[#0e1117]">
                          {offer.couponCode}
                        </span>
                      </div>

                      <span
                        className={[
                          "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all",
                          isCopied
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-white text-[#0e1117] shadow-sm border border-slate-200",
                        ].join(" ")}
                      >
                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                        {isCopied ? "Copied" : "Copy"}
                      </span>
                    </button>
                  ) : null}

                  {/* CTA BUTTON */}
                  <Link
                    href="/shop"
                    className="group/button mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0e1117] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:bg-[#244892]"
                  >
                    Shop now
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover/button:translate-x-1"
                    />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* MOBILE LINK */}
        <div className="mt-10 flex justify-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#244892]"
          >
            View all products
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
