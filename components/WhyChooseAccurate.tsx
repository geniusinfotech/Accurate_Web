
import {
  ShieldCheck,
  Droplets,
  Leaf,
  Truck,
  Award,
  ArrowUpRight,
} from "lucide-react";

const REASONS = [
  {
    number: "01",
    icon: Droplets,
    title: "Powerful Cleaning",
    description:
      "Concentrated washing liquids designed to tackle everyday dirt, stubborn stains and unwanted odours.",
    tag: "EVERYDAY PERFORMANCE",
  },
  {
    number: "02",
    icon: Leaf,
    title: "Thoughtfully Formulated",
    description:
      "Balanced formulations that combine effective cleaning with care for your fabrics and everyday routines.",
    tag: "MADE FOR DAILY USE",
  },
  {
    number: "03",
    icon: Truck,
    title: "Delivery to Your Door",
    description:
      "Convenient ordering, quick dispatch from our Surat facility and free shipping on qualifying orders.",
    tag: "CONVENIENCE, DELIVERED",
  },
  {
    number: "04",
    icon: Award,
    title: "Proudly Made in India",
    description:
      "Made in Varachha, Surat, with a focus on dependable quality and products for everyday Indian homes.",
    tag: "ROOTED IN SURAT",
  },
];

export function WhyChooseAccurate() {
  return (
    <section
      aria-labelledby="why-accurate-heading"
      className="relative isolate overflow-hidden border-y border-slate-200/80 bg-[#f7f9fd] py-20 sm:py-24 lg:py-28"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-32 -z-10 size-[360px] rounded-full bg-[#244892]/[0.055] blur-3xl sm:size-[480px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 -z-10 size-[320px] rounded-full bg-orange-400/[0.07] blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Section heading */}
        <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#244892]/15 bg-white px-4 py-2 shadow-sm">
              <span className="size-2 rounded-full bg-orange-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#244892] sm:text-[11px]">
                The Accurate difference
              </span>
            </div>

            <h2
              id="why-accurate-heading"
              className="font-serif text-4xl font-normal leading-[1.12] tracking-tight text-[#101b31] sm:text-5xl lg:text-6xl"
            >
              A cleaner home.
              <br />
              <span className="italic text-[#244892]">
                A smarter choice.
              </span>
            </h2>
          </div>

          <div className="max-w-lg lg:justify-self-end lg:pb-1">
            <p className="text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Everyday cleaning deserves thoughtful products and dependable
              service. Discover what makes Accurate Liquid a part of your
              everyday routine.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <div className="h-px w-12 bg-orange-500" />
              <span className="text-xs font-semibold tracking-wide text-[#244892]">
                QUALITY IN EVERY DROP
              </span>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 xl:grid-cols-4">
          {REASONS.map((reason) => {
            const Icon = reason.icon;

            return (
              <article
                key={reason.number}
                className="group relative flex min-h-[290px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_5px_25px_rgba(20,40,80,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#244892]/25 hover:shadow-[0_18px_45px_rgba(36,72,146,0.10)] sm:p-7"
              >
                {/* Top accent */}
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#244892] via-[#5278c7] to-orange-400 transition-transform duration-300 group-hover:scale-x-100" />

                <div className="flex items-start justify-between">
                  <div className="grid size-14 place-items-center rounded-2xl bg-[#edf2fe] text-[#244892] ring-1 ring-inset ring-[#244892]/[0.06] transition-colors duration-300 group-hover:bg-[#244892] group-hover:text-white">
                    <Icon size={25} strokeWidth={1.7} />
                  </div>

                  <span className="font-serif text-3xl font-normal tracking-tight text-slate-200 transition-colors duration-300 group-hover:text-[#244892]/25">
                    {reason.number}
                  </span>
                </div>

                <h3 className="mt-7 font-serif text-[22px] font-medium leading-snug text-[#101b31]">
                  {reason.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                  {reason.description}
                </p>

                <div className="mt-7 flex items-center justify-between gap-2 border-t border-slate-100 pt-5">
                  <span className="text-[9px] font-bold tracking-[0.13em] text-[#244892] sm:text-[10px]">
                    {reason.tag}
                  </span>

                  <ArrowUpRight
                    size={17}
                    strokeWidth={1.7}
                    aria-hidden="true"
                    className="shrink-0 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-orange-500"
                  />
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom trust strip */}
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#244892]/10 bg-white/80 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#edf2fe] text-[#244892]">
              <ShieldCheck size={21} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#101b31]">
                Quality you can feel good about
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Thoughtful products for your everyday cleaning needs.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 self-start rounded-full bg-orange-50 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.13em] text-orange-700 sm:self-auto">
            <span className="size-1.5 rounded-full bg-orange-500" />
            Made with care in Surat
          </span>
        </div>
      </div>
    </section>
  );
}