"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { api, getUploadUrl } from "@/lib/api";
import type { Banner } from "@/lib/types/api";

const AUTOPLAY_MS = 6000;

function isVideo(path?: string, type?: string) {
  if (type === "video") return true;
  if (type === "image") return false;

  return /\.(mp4|webm|mov|ogg)$/i.test(path || "");
}

function mediaUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return getUploadUrl(path, "banners");
}

export function HomeBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;

    api
      .get<Banner[] | { items: Banner[] }>("/banners")
      .then((res) => {
        if (!mounted) return;

        const list = Array.isArray(res) ? res : res?.items || [];

        const live = list
          .filter(
            (banner) =>
              banner.isActive !== false &&
              (banner.desktopMedia || banner.mobileMedia),
          )
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

        setBanners(live);
      })
      .catch(() => {
        if (mounted) setBanners([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const go = useCallback(
    (direction: 1 | -1) => {
      setIndex((current) => {
        if (banners.length === 0) return 0;

        return (current + direction + banners.length) % banners.length;
      });
    },
    [banners.length],
  );

  useEffect(() => {
    if (banners.length <= 1 || paused) return;

    timer.current = setInterval(() => {
      go(1);
    }, AUTOPLAY_MS);

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [banners.length, paused, go]);

  if (banners.length === 0) {
    return null;
  }

  const active = banners[index];

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-950"
      aria-label="Featured banners"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[1080/1000] w-full lg:aspect-[1920/800]">
        {banners.map((banner, i) => {
          const desktop = mediaUrl(banner.desktopMedia);

          const mobile = mediaUrl(banner.mobileMedia) || desktop;

          const selected = i === index;

          const desktopVideo = isVideo(
            banner.desktopMedia,
            banner.desktopMediaType,
          );

          const mobileVideo = isVideo(
            banner.mobileMedia || banner.desktopMedia,
            banner.mobileMediaType || banner.desktopMediaType,
          );

          const slideContent = (
            <div className="relative h-full w-full">
              {/* =========================
                  DESKTOP MEDIA
              ========================== */}

              {desktop && desktopVideo ? (
                <video
                  key={`desktop-${banner._id}`}
                  className="absolute inset-0 hidden h-full w-full object-contain lg:block"
                  src={desktop}
                  autoPlay={selected}
                  muted
                  loop
                  playsInline
                  preload={selected ? "auto" : "metadata"}
                />
              ) : desktop ? (
                <img
                  src={desktop}
                  alt={banner.title}
                  className="absolute inset-0 hidden h-full w-full object-contain lg:block"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              ) : null}

              {/* =========================
                  MOBILE MEDIA
              ========================== */}

              {mobile && mobileVideo ? (
                <video
                  key={`mobile-${banner._id}`}
                  className="absolute inset-0 block h-full w-full object-contain lg:hidden"
                  src={mobile}
                  autoPlay={selected}
                  muted
                  loop
                  playsInline
                  preload={selected ? "auto" : "metadata"}
                />
              ) : mobile ? (
                <img
                  src={mobile}
                  alt={banner.title}
                  className="absolute inset-0 block h-full w-full object-cover lg:hidden"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              ) : null}
            </div>
          );

          const wrapped = banner.link ? (
            <Link
              href={banner.link}
              aria-label={
                banner.ctaText
                  ? `${banner.ctaText}: ${banner.title}`
                  : banner.title
              }
              className="block h-full w-full"
            >
              {slideContent}
            </Link>
          ) : (
            slideContent
          );

          return (
            <article
              key={banner._id || banner.id || i}
              className={[
                "absolute inset-0 transition-opacity duration-700 ease-in-out",
                selected
                  ? "z-10 opacity-100"
                  : "z-0 opacity-0 pointer-events-none",
              ].join(" ")}
              aria-hidden={!selected}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${banners.length}`}
            >
              {wrapped}
            </article>
          );
        })}

        {/* =========================
            BOTTOM CONTROLS
        ========================== */}

        {banners.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 z-20">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
              {/* Slide Counter */}
              <div className="hidden items-center gap-2 text-sm text-white/80 sm:flex">
                <span className="font-semibold text-white">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="h-px w-8 bg-white/40" />

                <span>{String(banners.length).padStart(2, "0")}</span>
              </div>

              {/* Progress Dots */}
              <div
                className="flex items-center gap-2"
                role="tablist"
                aria-label="Choose banner"
              >
                {banners.map((banner, i) => (
                  <button
                    key={banner._id || i}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Show banner ${i + 1}: ${banner.title}`}
                    onClick={() => setIndex(i)}
                    className="group flex h-6 items-center"
                  >
                    <span
                      className={[
                        "block h-1 rounded-full transition-all duration-300",
                        i === index
                          ? "w-10 bg-white"
                          : "w-5 bg-white/40 group-hover:bg-white/70",
                      ].join(" ")}
                    />
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous banner"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-slate-900"
                >
                  <ChevronLeft size={19} />
                </button>

                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next banner"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-slate-900"
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================
            MOBILE SLIDE INDICATOR
        ========================== */}

        {banners.length > 1 && (
          <div className="absolute right-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-xs text-white backdrop-blur-md sm:hidden">
            <Play size={10} fill="currentColor" />

            <span>
              {index + 1} / {banners.length}
            </span>
          </div>
        )}
      </div>

      {/* Screen reader status */}
      <span className="sr-only" aria-live="polite">
        {active.title}
      </span>
    </section>
  );
}
