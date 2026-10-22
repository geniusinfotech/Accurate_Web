"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { api, getImageUrl } from "@/lib/api";
import type { Category } from "@/lib/types/api";

const FALLBACK_CATEGORIES = [
  {
    _id: "1",
    name: "Laundry Care",
    slug: "laundry-care",
    image:
      "https://images.unsplash.com/photo-1582735689149-c12e524bd645?auto=format&fit=crop&q=80&w=1000",
  },
  {
    _id: "2",
    name: "Dish Care",
    slug: "dish-care",
    image:
      "https://images.unsplash.com/photo-1585002242080-60fbebb84eb6?auto=format&fit=crop&q=80&w=1000",
  },
  {
    _id: "3",
    name: "Surface Care",
    slug: "surface-care",
    image:
      "https://images.unsplash.com/photo-1584820927498-cafe4c10776b?auto=format&fit=crop&q=80&w=1000",
  },
  {
    _id: "4",
    name: "Specialized Cleaning",
    slug: "specialized-cleaning",
    image:
      "https://images.unsplash.com/photo-1596755490731-0df04f4a3e9c?auto=format&fit=crop&q=80&w=1000",
  },
  {
    _id: "5",
    name: "Personal Care",
    slug: "personal-care",
    image:
      "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&q=80&w=1000",
  },
  {
    _id: "6",
    name: "Toilet Cleaner",
    slug: "toilet-cleaner-liquid",
    image:
      "https://images.unsplash.com/photo-1584820927506-697960fc5d4c?auto=format&fit=crop&q=80&w=1000",
  },
];

interface DisplayCategory {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

function resolveImage(path?: string) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/images/")) {
    return path;
  }
  return getImageUrl(path);
}

export function HomeCategories() {
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef(0);
  const initialScroll = useRef(0);

  useEffect(() => {
    let mounted = true;

    api
      .get<Category[] | { items: Category[] }>("/categories")
      .then((res) => {
        if (!mounted) return;

        const list = Array.isArray(res) ? res : res?.items || [];

        const active = list.filter((category) => category.isActive !== false);

        if (active.length) {
          setCategories(
            active.map((category, index) => ({
              _id: category._id || category.id,
              name: category.name,
              slug:
                category.slug ||
                category.name.toLowerCase().replace(/\s+/g, "-"),
              image:
                resolveImage(category.homepageCoverImage || category.image) ||
                FALLBACK_CATEGORIES[index % FALLBACK_CATEGORIES.length].image,
            })),
          );
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }
      })
      .catch(() => {
        if (mounted) {
          setCategories(FALLBACK_CATEGORIES);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateActiveCard = () => {
    const container = scrollRef.current;
    if (!container) return;

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>("[data-category-card]"),
    );

    if (!cards.length) return;

    const center = container.scrollLeft + container.clientWidth / 2;

    let closest = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    setActiveIndex(closest);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("scroll", updateActiveCard, {
      passive: true,
    });

    updateActiveCard();

    return () => {
      container.removeEventListener("scroll", updateActiveCard);
    };
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;

    if (!container) return;

    const amount = container.clientWidth * 0.72;

    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    const container = scrollRef.current;

    if (!container) return;

    setIsDragging(true);

    dragStart.current = event.pageX - container.getBoundingClientRect().left;

    initialScroll.current = container.scrollLeft;
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return;

    const container = scrollRef.current;

    if (!container) return;

    event.preventDefault();

    const currentX = event.pageX - container.getBoundingClientRect().left;

    const distance = (currentX - dragStart.current) * 1.15;

    container.scrollLeft = initialScroll.current - distance;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!categories.length) return null;

  return (
    <section
      className="relative overflow-hidden border-t border-slate-200/80 bg-slate-50/50 py-20 sm:py-24 lg:py-28"
      aria-labelledby="categories-heading"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#244892]/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* ================= HEADER ================= */}
        <div className="mb-10 flex flex-col gap-8 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#244892]">
                Explore our collection
              </span>

              <span className="h-px w-12 bg-[#244892]/30" />
            </div>

            <h2
              id="categories-heading"
              className="font-serif text-[clamp(2.6rem,5vw,5rem)] font-normal leading-[0.96] tracking-[-0.045em] text-[#0e1117]"
            >
              Everything you need
              <br />
              <em className="text-[#244892]">for a cleaner home.</em>
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#244892] sm:text-base">
              Explore our carefully selected range of everyday cleaning
              essentials, created to make your routine simpler and better.
            </p>
          </div>

          {/* Desktop navigation */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous categories"
              className="group grid size-12 place-items-center rounded-full border border-slate-200 bg-white transition-all duration-300 hover:border-[#244892] hover:bg-[#244892] hover:text-white shadow-sm"
            >
              <ChevronLeft
                size={19}
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next categories"
              className="group grid size-12 place-items-center rounded-full border border-slate-200 bg-white transition-all duration-300 hover:border-[#244892] hover:bg-[#244892] hover:text-white shadow-sm"
            >
              <ChevronRight
                size={19}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>

        {/* ================= CATEGORY TRACK ================= */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex gap-4 overflow-x-auto pb-4 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
          }}
        >
          {categories.map((category, index) => (
            <Link
              key={category._id}
              href={`/shop?category=${category.slug}`}
              data-category-card
              draggable={false}
              className="group relative block w-[78vw] shrink-0 sm:w-[45vw] md:w-[32vw] lg:w-[24vw] xl:w-[21vw]"
            >
              <article
                className={`relative aspect-[0.78] overflow-hidden rounded-[22px] border border-slate-200/80 bg-slate-100 transition-all duration-500 ${
                  activeIndex === index
                    ? "shadow-[0_18px_55px_rgba(36,72,146,0.12)]"
                    : "shadow-none"
                }`}
              >
                {/* Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />

                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                {/* Top label */}
                <div className="absolute left-5 top-5">
                  <span className="rounded-full border border-white/25 bg-black/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                    0{index + 1}
                  </span>
                </div>

                {/* Arrow */}
                <div className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-[#0e1117]">
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </div>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-px w-6 bg-white/60" />

                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70">
                      Category
                    </span>
                  </div>

                  <h3 className="max-w-[90%] font-serif text-[25px] font-normal leading-tight text-white sm:text-[28px]">
                    {category.name}
                  </h3>

                  <div className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 transition-colors group-hover:text-white">
                    Explore collection
                    <ArrowRight
                      size={13}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* ================= BOTTOM ================= */}
        <div className="mt-8 flex flex-col items-center justify-between gap-5 sm:flex-row">
          {/* Progress indicators */}
          <div className="flex items-center gap-1.5">
            {categories.map((category, index) => (
              <button
                key={category._id}
                type="button"
                aria-label={`Go to ${category.name}`}
                onClick={() => {
                  const container = scrollRef.current;
                  const card = container?.querySelectorAll(
                    "[data-category-card]",
                  )[index] as HTMLElement | undefined;

                  card?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                  });
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? "w-8 bg-[#244892]"
                    : "w-1.5 bg-slate-200 hover:bg-slate-300"
                }`}
              />
            ))}
          </div>

          {/* View all */}
          <Link
            href="/categories"
            className="group inline-flex items-center gap-3 border-b border-[#0e1117] pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0e1117] transition-all hover:border-[#244892] hover:text-[#244892]"
          >
            View all categories
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 640px) {
          section {
            scroll-margin-top: 80px;
          }
        }
      `}</style>
    </section>
  );
}
