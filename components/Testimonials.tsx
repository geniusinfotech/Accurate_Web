"use client";

import React, { useRef, useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { api, getImageUrl } from "@/lib/api";

export interface Testimonial {
  _id?: string;
  id?: string;
  name?: string;
  customerName?: string;
  text?: string;
  comment?: string;
  rating?: number;
  image?: string;
  customerPost?: string;
  isActive?: boolean;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

export function Testimonials({
  testimonials: initialTestimonials,
}: TestimonialsProps) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials || []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    if (initialTestimonials && initialTestimonials.length > 0) {
      setItems(initialTestimonials);
      return;
    }

    let mounted = true;
    api
      .get<Testimonial[] | { items: Testimonial[] }>("/testimonials")
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res) ? res : res?.items || [];
        const active = list.filter((t) => t.isActive !== false);
        setItems(active);
      })
      .catch(() => {
        if (mounted) setItems([]);
      });

    return () => {
      mounted = false;
    };
  }, [initialTestimonials]);

  const activeItems = items;

  // Triplicate testimonials to guarantee a seamless continuous loop
  const displayTestimonials = [...activeItems, ...activeItems, ...activeItems];

  const resolveImage = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("/images/")) return path;
    return getImageUrl(path);
  };

  // INFINITE CONTINUOUS LOOP WITH PAUSE ON HOVER
  useEffect(() => {
    const container = scrollRef.current;
    if (
      !container ||
      isHovered ||
      isDragging ||
      displayTestimonials.length === 0
    ) {
      return;
    }

    let animationFrameId: number;
    const speed = 0.8; // Smooth pixel speed per frame

    const scrollStep = () => {
      if (!container) return;

      container.scrollLeft += speed;

      // Seamlessly wrap position back when reaching the end of second set
      const oneSetWidth = container.scrollWidth / 3;
      if (container.scrollLeft >= oneSetWidth * 2) {
        container.scrollLeft -= oneSetWidth;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += oneSetWidth;
      }

      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isDragging, displayTestimonials.length]);

  // MOUSE DRAG HANDLERS
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (activeItems.length === 0) return null;

  return (
    <section className="limewash-section relative overflow-hidden py-20 sm:py-24 lg:py-28 border-t border-slate-200 select-none">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Header Section */}
        <div className="mb-14 max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-10 bg-[#244892]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#244892]">
              Customer Stories
            </span>
          </div>

          <h2 className="font-serif text-4xl font-normal leading-[1.08] tracking-tight text-[#0e1117] sm:text-5xl">
            Loved in everyday homes.{" "}
            <em className="font-serif italic font-normal text-[#244892]">
              Real feedback.
            </em>
          </h2>
        </div>

        {/* Infinite Carousel Track */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => {
            setIsDragging(false);
            setIsHovered(false);
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          className="flex gap-6 overflow-x-auto pt-4 pb-8 scrollbar-hide cursor-grab active:cursor-grabbing"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>

          {displayTestimonials.map((testimonial, index) => {
            const authorName =
              testimonial.customerName ||
              testimonial.name ||
              "Satisfied Customer";
            const bodyText = testimonial.text || testimonial.comment || "";
            const imageUrl = resolveImage(testimonial.image);
            const rating = testimonial.rating || 5;

            return (
              <div
                key={`${testimonial._id || index}-${index}`}
                className="shrink-0 w-[85vw] sm:w-[50vw] md:w-[40vw] lg:w-[28vw] pt-4"
              >
                {/* Main Card */}
                <div className="relative flex flex-col justify-between h-full rounded-2xl border border-slate-200 bg-white p-7 shadow-xs transition-all duration-300 hover:border-[#244892]/40 hover:shadow-sm">
                  <div>
                    {/* Stars & Quote Icon */}
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#df6236]">
                        {Array.from({ length: rating }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <Quote size={20} className="text-[#0e1117]/20" />
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-sm leading-6 text-[#0e1117]/80 font-normal">
                      &ldquo;{bodyText}&rdquo;
                    </p>
                  </div>

                  {/* Author Profile */}
                  <div className="mt-8 flex items-center gap-3.5 border-t border-slate-200/80 pt-5">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={authorName}
                        className="size-10 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="grid size-10 place-items-center rounded-full bg-[#edf2fe] text-[#244892] font-serif text-sm font-semibold border border-[#244892]/20">
                        {authorName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-serif text-base font-normal text-[#0e1117]">
                        {authorName}
                      </h4>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#244892]">
                        {testimonial.customerPost || "Verified Buyer"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const CustomerStories = Testimonials;
