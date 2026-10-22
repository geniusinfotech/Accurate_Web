"use client";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Droplets,
  Heart,
  Leaf,
  MapPin,
  Phone,
  Recycle,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { PageFrame } from "@/components/storefront";

const values = [
  {
    number: "01",
    icon: Droplets,
    title: "Powerful cleaning",
    description:
      "Designed to tackle everyday dirt, stains, and odours while leaving clothes feeling fresh.",
    detail: "Everyday laundry care",
    color: "bg-blue-50 text-[#244892]",
  },
  {
    number: "02",
    icon: Leaf,
    title: "Thoughtful formulas",
    description:
      "A balanced approach to effective cleaning and a pleasant experience in your daily routine.",
    detail: "Made for daily routines",
    color: "bg-emerald-50 text-emerald-800",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Quality you trust",
    description:
      "We focus on consistency and quality to make everyday laundry a little more dependable.",
    detail: "Quality-focused production",
    color: "bg-amber-50 text-amber-800",
  },
];

const differences = [
  {
    icon: Recycle,
    title: "Purposeful packaging",
    description: "Practical formats for everyday cleaning needs.",
  },
  {
    icon: Heart,
    title: "Made with care",
    description: "Created with everyday homes and families in mind.",
  },
  {
    icon: Waves,
    title: "A fresher feeling",
    description: "A pleasant cleaning experience, wash after wash.",
  },
  {
    icon: ShieldCheck,
    title: "Dependable quality",
    description: "Consistency you can count on in your routine.",
  },
];

const branches = [
  {
    name: "મેઈન બ્રાન્ચ",
    type: "HEAD OFFICE",
    address:
      "1, ગોપનિવાસ, સર્વોદય સોસાયટી, ઉમિયાધામ મંદિરની બાજુમાં, વરાછા, સુરત - 395006",
    phone: "+91 99099 46147",
    timing: "Mon – Sun: 9:00 AM – 8:30 PM",
    isMain: true,
  },
  {
    name: "યોગીચોક બ્રાન્ચ",
    type: "SUB BRANCH",
    address: "26, સિલ્વર ક્રેસ્ટ, ડી માર્ટની સામે, યોગીચોક, સુરત - 395010",
    phone: "+91 9909 94683",
    timing: "Mon – Sun: 9:30 AM – 7:00 PM",
    isMain: false,
  },
  {
    name: "ઉત્રાણ બ્રાન્ચ",
    type: "SUB BRANCH",
    address:
      "14, સેન્ટોસા હાઇટ્સ, મનીષા ગરનાળાની બાજુમાં, એમ્બલીવેલી સામે, ઉત્રાણ, સુરત - 394105 ",
    phone: "+91 99099 46186",
    timing: "Mon – Sun: 9:00 AM – 7:00 PM",
    isMain: false,
  },
  {
    name: "કતારગામ બ્રાન્ચ",
    type: "SUB BRANCH",
    address: "1, અક્ષત ફ્લેટ્સ, ભગુનગરની મેઈન રોડ, કતારગામ, સુરત - 395004",
    phone: "+91 99099 46186",
    timing: "Mon – Sun: 9:00 AM – 7:00 PM",
    isMain: false,
  },
  {
    name: "સરથાણા બ્રાન્ચ",
    type: "SUB BRANCH",
    address:
      "બી-12, શિવ પ્લાઝા, ગઢપુર રોડ, નવજીવન હોટલની સામે, ડેરીડોનની પાછળ, સરથાણા જકાતનાકા, સુરત - 395010",
    phone: "+91 99099 46171",
    timing: "Mon – Sun: 9:00 AM – 7:00 PM",
    isMain: false,
  },
];

export default function About() {
  return (
    <PageFrame>
      <main className="overflow-hidden bg-white text-[#14233b]">
        {/* HERO */}
        <section className="relative isolate bg-[#f3f7ff]">
          <div className="pointer-events-none absolute -right-24 -top-24 -z-10 size-[420px] rounded-full bg-blue-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-0 -z-10 size-72 rounded-full bg-cyan-100/40 blur-3xl" />

          <div className="wrap">
            <div className="grid items-center gap-12 py-16 sm:py-20 md:min-h-[660px] md:grid-cols-[1.05fr_0.95fr] md:gap-8 lg:gap-16 lg:py-24">
              <div className="relative z-10">
                <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-blue-200 bg-white/80 px-4 py-2">
                  <span className="size-2 rounded-full bg-[#244892]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#244892]">
                    Our story · Accurate & Umiyadham
                  </span>
                </div>

                <h1 className="max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-[#14233b] sm:text-6xl lg:text-[76px]">
                  A little more care.
                  <span className="mt-2 block font-serif font-normal italic text-[#315db0]">
                    In every wash.
                  </span>
                </h1>

                <p className="mt-7 max-w-lg text-base leading-8 text-slate-600 sm:text-lg">
                  Everyday cleaning should do more than remove stains. It should
                  bring freshness to your clothes, comfort to your home, and
                  simplicity to your routine.
                </p>

                <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
                  Born in Varachha, Surat, Accurate and Umiyadham began with a
                  simple purpose: bringing dependable cleaning performance into
                  everyday homes.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <Link
                    href="/shop"
                    className="group inline-flex items-center gap-3 rounded-full bg-[#19366f] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition-all hover:-translate-y-0.5 hover:bg-[#244892]"
                  >
                    Explore our products
                    <ArrowUpRight
                      size={17}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-7 py-4 text-sm font-semibold text-[#19366f] transition hover:border-[#244892] hover:bg-white"
                  >
                    Get in touch
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="mt-10 flex items-center gap-3 border-t border-blue-200/70 pt-6">
                  <div className="flex -space-x-2">
                    <span className="grid size-9 place-items-center rounded-full border-2 border-[#f3f7ff] bg-blue-100 text-[#244892]">
                      <Droplets size={16} />
                    </span>
                    <span className="grid size-9 place-items-center rounded-full border-2 border-[#f3f7ff] bg-emerald-100 text-emerald-800">
                      <Leaf size={16} />
                    </span>
                    <span className="grid size-9 place-items-center rounded-full border-2 border-[#f3f7ff] bg-amber-100 text-amber-800">
                      <Sparkles size={16} />
                    </span>
                  </div>
                  <p className="text-xs leading-5 text-slate-600">
                    <span className="block font-semibold text-[#19366f]">
                      Care in the little things
                    </span>
                    Thoughtful everyday cleaning
                  </p>
                </div>
              </div>

              {/* Product showcase */}
              <div className="relative mx-auto w-full max-w-[510px]">
                <div className="relative aspect-[4/4.5] overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-[#e3edff] via-[#f8fbff] to-[#d9e7ff] shadow-xl shadow-blue-900/10">
                  <div className="absolute left-7 top-7 z-10">
                    <span className="rounded-full border border-white/80 bg-white/75 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#244892] backdrop-blur">
                      Everyday essentials
                    </span>
                  </div>

                  <div className="absolute left-1/2 top-[47%] size-[270px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/25 sm:size-[320px]" />
                  <div className="absolute left-1/2 top-[47%] size-[215px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-2xl sm:size-[260px]" />

                  {/* Decorative water droplets */}
                  <Droplets
                    className="absolute right-[15%] top-[22%] text-blue-300/80"
                    size={35}
                  />
                  <Sparkles
                    className="absolute left-[15%] top-[35%] text-[#6b91d8]"
                    size={24}
                  />
                  <Sparkles
                    className="absolute bottom-[30%] right-[17%] text-blue-300"
                    size={18}
                  />

                  {/* CSS product bottle */}
                  <div className="absolute left-1/2 top-[47%] h-[285px] w-[164px] -translate-x-1/2 -translate-y-1/2 sm:h-[325px] sm:w-[185px]">
                    <div className="absolute left-1/2 top-0 z-10 h-12 w-[76px] -translate-x-1/2 rounded-t-xl border border-slate-300 bg-gradient-to-r from-slate-100 via-white to-slate-200 shadow-sm" />

                    <div className="absolute inset-x-0 bottom-0 top-9 overflow-hidden rounded-[26px] border border-white bg-gradient-to-r from-white via-[#f8fbff] to-[#e1eafa] shadow-[0_25px_55px_-20px_rgba(29,57,111,0.32)]">
                      <div className="absolute inset-y-0 left-3 w-3 rounded-full bg-white/80" />

                      <div className="absolute inset-x-3 top-[21%] overflow-hidden rounded-2xl border border-blue-100 bg-white px-2 py-7 text-center shadow-sm sm:py-8">
                        <div className="mx-auto grid size-11 place-items-center rounded-full bg-[#edf3ff] text-[#244892]">
                          <Droplets size={24} />
                        </div>
                        <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#244892]">
                          Accurate
                        </p>
                        <div className="mx-auto my-3 h-px w-10 bg-blue-200" />
                        <p className="font-serif text-lg leading-tight text-[#14233b] sm:text-xl">
                          Washing
                          <br />
                          Liquid
                        </p>
                        <p className="mt-3 text-[8px] font-medium uppercase tracking-[0.17em] text-slate-400">
                          Everyday fabric care
                        </p>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-r from-blue-100/50 via-white to-blue-100/70" />
                    </div>
                  </div>

                  {/* Floating freshness card */}
                  <div className="absolute bottom-6 left-4 right-4 flex items-center gap-4 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-lg shadow-blue-900/10 backdrop-blur-xl sm:bottom-8 sm:left-7 sm:right-auto sm:min-w-[255px]">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf3ff] text-[#244892]">
                      <Sparkles size={21} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#14233b]">
                        Freshness, made simple
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        For your everyday laundry
                      </p>
                    </div>
                  </div>

                  <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 [writing-mode:vertical-rl] sm:block">
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#7894c4]">
                      Clean · Care · Comfort
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-center text-[10px] text-slate-400">
                  A visual concept for the Accurate washing liquid range.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BRAND INTRO */}
        <section className="relative overflow-hidden border-y border-slate-100 bg-white py-20 sm:py-24 md:py-28">
          <div className="wrap">
            <div className="mx-auto max-w-4xl text-center">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#315db0]">
                <span className="h-px w-7 bg-[#315db0]" />
                Why we started
                <span className="h-px w-7 bg-[#315db0]" />
              </span>

              <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-medium leading-tight tracking-tight text-[#14233b] sm:text-4xl md:text-5xl">
                Because clean clothes should feel as good as they look.
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-slate-500 sm:text-base">
                Laundry is part of everyday life. We want to make that daily
                ritual simpler with washing liquids focused on effective
                cleaning, pleasant freshness, and thoughtful care.
              </p>

              <Link
                href="/shop"
                className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#315db0] transition hover:text-[#14233b]"
              >
                Discover the range
                <ArrowUpRight
                  size={17}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="bg-[#f7f9fd] py-20 sm:py-24 md:py-28">
          <div className="wrap">
            <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#315db0]">
                  What matters to us
                </span>
                <h2 className="mt-4 max-w-xl text-3xl font-medium leading-tight tracking-tight text-[#14233b] sm:text-4xl md:text-5xl">
                  Simple values.
                  <span className="block font-serif font-normal italic text-[#315db0]">
                    Serious about clean.
                  </span>
                </h2>
              </div>

              <p className="max-w-sm text-sm leading-7 text-slate-500">
                Everyday essentials, guided by a straightforward approach to
                cleaning and care.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <article
                    key={value.number}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 sm:p-8"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`grid size-12 place-items-center rounded-2xl ${value.color}`}
                      >
                        <Icon size={23} strokeWidth={1.7} />
                      </div>
                      <span className="font-mono text-xs text-slate-300">
                        / {value.number}
                      </span>
                    </div>

                    <h3 className="mt-8 text-xl font-semibold tracking-tight text-[#14233b]">
                      {value.title}
                    </h3>

                    <p className="mt-3 min-h-[84px] text-sm leading-7 text-slate-500">
                      {value.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-5 text-xs font-semibold text-[#315db0]">
                      <span className="grid size-5 place-items-center rounded-full bg-blue-50">
                        <Check size={12} />
                      </span>
                      {value.detail}
                    </div>

                    <div className="absolute -bottom-10 -right-10 size-28 rounded-full bg-blue-50/70 transition-transform duration-500 group-hover:scale-150" />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* THE ACCURATE DIFFERENCE */}
        <section className="relative overflow-hidden bg-[#142c54] py-20 text-white sm:py-24 md:py-28">
          <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-8 size-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="wrap relative">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-blue-300">
                  <span className="size-2 rounded-full bg-blue-300" />
                  The Accurate difference
                </span>

                <h2 className="mt-6 text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                  Less complexity.
                  <span className="mt-2 block font-serif font-normal italic text-blue-300">
                    More confidence.
                  </span>
                </h2>

                <p className="mt-6 max-w-md text-sm leading-8 text-blue-100/75 sm:text-base">
                  From the formula to the bottle, we believe good products
                  should be easy to understand, easy to use, and dependable
                  enough to become part of your everyday routine.
                </p>

                <Link
                  href="/shop"
                  className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#19366f] transition hover:bg-blue-50"
                >
                  Find your everyday clean
                  <ArrowUpRight
                    size={17}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {differences.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 transition-colors duration-300 hover:border-blue-300/40 hover:bg-white/[0.10] sm:p-7"
                    >
                      <div className="flex items-start justify-between">
                        <div className="grid size-11 place-items-center rounded-xl border border-blue-200/15 bg-blue-300/10 text-blue-200">
                          <Icon size={21} strokeWidth={1.7} />
                        </div>
                        <span className="font-mono text-[10px] text-blue-200/40">
                          0{index + 1}
                        </span>
                      </div>

                      <h3 className="mt-6 text-lg font-semibold text-white">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-blue-100/65">
                        {item.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* OUR BRANCHES */}
        <section className="bg-[#f7f9fd] py-20 sm:py-24 md:py-28">
          <div className="wrap">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#315db0]">
                <span className="h-px w-7 bg-[#315db0]" />
                Find us near you
                <span className="h-px w-7 bg-[#315db0]" />
              </span>

              <h2 className="mt-5 text-3xl font-medium tracking-tight text-[#14233b] sm:text-4xl md:text-5xl">
                Our branches.
                <span className="mt-2 block font-serif font-normal italic text-[#315db0]">
                  Always here for you.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                Visit our main office or connect with one of our four branches
                for information about Accurate and Umiyadham products.
              </p>
            </div>

            {/* Main Branch */}
            {branches
              .filter((branch) => branch.isMain)
              .map((branch) => (
                <article
                  key={branch.name}
                  className="relative mt-12 overflow-hidden rounded-3xl bg-[#142c54] p-7 text-white shadow-xl shadow-blue-900/10 sm:p-10"
                >
                  <div className="pointer-events-none absolute -right-12 -top-16 size-64 rounded-full border border-white/10" />
                  <div className="pointer-events-none absolute -right-4 -top-8 size-44 rounded-full border border-white/10" />

                  <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/20 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
                        <span className="size-2 rounded-full bg-emerald-400" />
                        {branch.type}
                      </span>

                      <h3 className="mt-5 text-2xl font-semibold sm:text-3xl">
                        {branch.name}
                      </h3>

                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <div className="flex items-start gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-blue-200">
                            <MapPin
                              size={17}
                              className="mt-0.5 shrink-0 text-white"
                            />
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-blue-200">
                              Address
                            </p>
                            <p className="mt-1 text-sm leading-6 text-white/80">
                              {branch.address}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-blue-200">
                            <Clock
                              size={17}
                              className="mt-0.5 shrink-0 text-white"
                            />
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-blue-200">
                              Opening hours
                            </p>
                            <p className="mt-1 text-sm leading-6 text-white/80">
                              {branch.timing}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`tel:${branch.phone.replace(/[^+\d]/g, "")}`}
                      className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-6 py-4 text-sm font-semibold text-[#19366f] transition hover:-translate-y-0.5 hover:bg-blue-50"
                    >
                      <Phone size={17} />
                      {branch.phone}
                    </a>
                  </div>
                </article>
              ))}

            {/* Four Sub-Branches */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {branches
                .filter((branch) => !branch.isMain)
                .map((branch, index) => (
                  <article
                    key={branch.name}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300/80 hover:shadow-2xl hover:shadow-blue-900/10"
                  >
                    <div>
                      {/* Header Section */}
                      <div className="flex items-center justify-between">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#315db0] transition-colors duration-300 group-hover:bg-[#315db0] group-hover:text-white">
                          <MapPin size={22} />
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Content Section */}
                      <div className="mt-5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#315db0]">
                          {branch.type}
                        </span>
                        <h3 className="mt-1 text-xl font-bold text-slate-900 group-hover:text-[#315db0] transition-colors">
                          {branch.name}
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {branch.address}
                        </p>
                      </div>

                      {/* Timing Info */}
                      <div className="mt-4 flex items-center gap-2.5 text-xs font-medium text-slate-500">
                        <Clock size={16} className="shrink-0 text-[#315db0]" />
                        <span>{branch.timing}</span>
                      </div>
                    </div>

                    {/* Phone Action Button */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <a
                        href={`tel:${branch.phone.replace(/[^+\d]/g, "")}`}
                        className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs font-semibold text-[#14233b] transition-all duration-200 hover:bg-[#315db0] hover:text-white hover:shadow-md"
                      >
                        <span className="flex items-center gap-2.5">
                          <Phone size={15} />
                          {branch.phone}
                        </span>
                        <ArrowUpRight
                          size={15}
                          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </a>
                    </div>
                  </article>
                ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-white py-20 sm:py-24 md:py-28">
          <div className="wrap">
            <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#edf3ff] px-6 py-14 sm:px-12 sm:py-16 md:px-16 md:py-20">
              <div className="pointer-events-none absolute -right-16 -top-20 -z-10 size-72 rounded-full bg-blue-200/50 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 left-1/3 -z-10 size-64 rounded-full bg-white/80 blur-3xl" />

              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-white bg-white/80 text-[#315db0] shadow-sm">
                  <Droplets size={26} strokeWidth={1.6} />
                </div>

                <span className="mt-6 block text-[10px] font-bold uppercase tracking-[0.25em] text-[#315db0]">
                  A better everyday routine
                </span>

                <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight text-[#14233b] sm:text-4xl md:text-5xl">
                  Bring a little more care to every wash.
                </h2>

                <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
                  Discover our washing liquids and find the right everyday clean
                  for your home.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/shop"
                    className="group inline-flex items-center gap-3 rounded-full bg-[#19366f] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#244892]"
                  >
                    Shop washing liquids
                    <ArrowUpRight
                      size={17}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-7 py-4 text-sm font-semibold text-[#19366f] transition hover:bg-white"
                  >
                    Talk to us
                    <ArrowDownRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
