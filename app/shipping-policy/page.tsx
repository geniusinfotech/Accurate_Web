"use client";

import { PageFrame } from "@/components/storefront";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Headphones,
  MapPin,
  Package,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

const sections = [
  {
    num: "01",
    title: "Shipping coverage",
    subtitle: "Where we deliver",
    icon: MapPin,
    content:
      "We currently ship across India. Orders are dispatched from our facility in Surat, Gujarat. Delivery timelines may vary depending on your location and the shipping method selected at checkout.",
  },
  {
    num: "02",
    title: "Processing time",
    subtitle: "Getting your order ready",
    icon: Package,
    content:
      "Orders are processed within 1–2 business days after payment confirmation. During sales or festive seasons, processing may take an additional 1–2 business days. You will receive an email confirmation once your order has been dispatched.",
  },
  {
    num: "03",
    title: "Delivery timelines",
    subtitle: "When to expect your parcel",
    icon: Clock3,
    content:
      "Standard delivery typically takes 4–7 business days depending on your location. Metro cities may receive orders sooner. Remote or rural areas may take up to 10 business days. These timelines are estimates and may vary due to factors beyond our control.",
  },
  {
    num: "04",
    title: "Shipping charges",
    subtitle: "Delivery costs",
    icon: PackageCheck,
    content:
      "Shipping charges are calculated at checkout based on order weight and delivery location. We may offer free shipping on orders above a certain value. Any applicable offers and shipping charges will be displayed on the website and at checkout.",
  },
  {
    num: "05",
    title: "Order tracking",
    subtitle: "Follow your delivery",
    icon: Truck,
    content:
      "Once your order is dispatched, you will receive a tracking number via email or SMS. You can use it to check your order status on our website or through the courier partner’s tracking page.",
  },
  {
    num: "06",
    title: "Delivery issues",
    subtitle: "We are here to help",
    icon: ShieldCheck,
    content:
      "If your order is delayed, lost, or damaged during transit, please contact us at accurateliquid@gmail.com within 48 hours of the expected delivery date. We will work with our shipping partner to resolve the issue promptly.",
  },
];

const highlights = [
  {
    icon: MapPin,
    value: "PAN INDIA",
    title: "Delivery coverage",
    description: "Shipping across India",
  },
  {
    icon: CalendarDays,
    value: "1–2 DAYS",
    title: "Order processing",
    description: "After payment confirmation",
  },
  {
    icon: Truck,
    value: "4–7 DAYS",
    title: "Standard delivery",
    description: "Estimated business days",
  },
];

export default function ShippingPolicy() {
  return (
    <PageFrame>
      <main className="overflow-hidden bg-[#fbfcfe] text-[#10213c]">
        {/* HERO SECTION */}
        <section className="relative isolate overflow-hidden border-b border-slate-200/70 bg-[#f2f6fc]">
          <div className="pointer-events-none absolute -right-24 -top-28 -z-10 size-[28rem] rounded-full bg-blue-200/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-[28%] -z-10 size-80 rounded-full bg-cyan-100/60 blur-3xl" />

          <div className="wrap">
            <div className="grid items-center gap-12 py-14 sm:py-20 md:grid-cols-[1.05fr_0.95fr] md:py-24 lg:gap-20">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
                  <span className="size-2 rounded-full bg-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-800">
                    Shipping &amp; delivery
                  </span>
                </div>

                <h1 className="mt-7 max-w-2xl text-5xl font-semibold leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
                  Good things
                  <span className="mt-2 block font-serif font-normal italic text-[#3568bd]">
                    are on the way.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                  From careful packing to your doorstep, here is everything you
                  need to know about getting your Accurate order delivered.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#shipping-details"
                    className="group inline-flex items-center gap-3 rounded-full bg-[#17376f] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/15 transition duration-300 hover:-translate-y-0.5 hover:bg-[#244b8e]"
                  >
                    Explore delivery details
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </a>

                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                    <CheckCircle2 size={16} className="text-blue-700" />
                    Clear, reliable information
                  </span>
                </div>
              </div>

              {/* CSS DELIVERY ILLUSTRATION */}
              <div className="relative mx-auto w-full max-w-[27rem]">
                <div className="absolute -inset-4 rounded-[2.5rem] border border-white/80" />

                <div className="relative aspect-[4/4.1] overflow-hidden rounded-[2rem] border border-white/90 bg-gradient-to-br from-white via-[#edf3fc] to-[#dce8fa] p-6 shadow-[0_30px_90px_-45px_rgba(23,55,111,0.35)] sm:p-8">
                  <div className="absolute -right-12 -top-12 size-56 rounded-full border border-blue-200/70" />
                  <div className="absolute -right-3 top-1 size-40 rounded-full border border-blue-200/70" />

                  <div className="absolute left-7 top-7 inline-flex items-center gap-2 rounded-full border border-white bg-white/85 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.17em] text-blue-800 shadow-sm">
                    <PackageCheck size={13} />
                    Packed with care
                  </div>

                  <div className="absolute inset-x-0 bottom-12 top-24 flex items-center justify-center">
                    <div className="relative flex h-44 w-48 items-center justify-center rounded-2xl border border-[#d2b98f] bg-gradient-to-br from-[#f4dfbc] via-[#e5c99a] to-[#cda66f] shadow-[0_28px_40px_-22px_rgba(23,55,111,0.4)] transition-transform duration-500 hover:rotate-2 sm:h-52 sm:w-56">
                      <div className="absolute inset-y-0 left-1/2 w-9 -translate-x-1/2 border-x border-[#c3a477]/60 bg-[#f8e8cb]/75" />

                      <div className="absolute -top-1 left-1/2 h-8 w-20 -translate-x-1/2 rounded-t-md border border-[#d2b98f] bg-[#f8e8cb]" />

                      <div className="relative grid size-[5.25rem] place-items-center rounded-2xl border border-white/80 bg-white/75 text-[#244b8e] shadow-sm backdrop-blur">
                        <Package size={39} strokeWidth={1.35} />
                      </div>

                      <div className="absolute -left-3 top-10 size-7 rounded-lg border border-[#c3a477]/60 bg-[#f4dfbc]" />
                      <div className="absolute -right-3 bottom-10 size-7 rounded-lg border border-[#c3a477]/60 bg-[#f4dfbc]" />
                    </div>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-lg shadow-blue-950/10 backdrop-blur-xl sm:bottom-7 sm:left-7 sm:right-7">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-800">
                      <Truck size={22} strokeWidth={1.7} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#10213c]">
                        Your order, on its way
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Dispatched from Surat, Gujarat
                      </p>
                    </div>

                    <ArrowDownRight size={18} className="text-blue-700" />
                  </div>
                </div>

                <div className="absolute -left-5 top-[35%] hidden items-center gap-2 rounded-xl border border-white bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-lg shadow-blue-950/5 sm:flex">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Order secured
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SHIPPING HIGHLIGHTS */}
        <section className="relative z-10 -mt-1 bg-white">
          <div className="wrap py-5 sm:py-7">
            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 transition duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/[0.04] sm:p-6"
                  >
                    <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eef4ff] text-[#2857a1] transition duration-300 group-hover:bg-[#17376f] group-hover:text-white">
                      <Icon size={21} strokeWidth={1.7} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-blue-700">
                        {item.value}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#10213c]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>

                    <span className="ml-auto self-start font-mono text-[10px] text-slate-300">
                      0{index + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SHIPPING POLICY DETAILS */}
        <section
          id="shipping-details"
          className="scroll-mt-24 bg-[#f5f7fb] py-16 sm:py-20 md:py-24"
        >
          <div className="wrap">
            <div className="mb-10 grid gap-5 md:mb-14 md:grid-cols-[1fr_0.65fr] md:items-end">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-700">
                  The delivery guide
                </span>

                <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#10213c] sm:text-4xl md:text-5xl">
                  The details, made
                  <span className="font-serif font-normal italic text-[#3568bd]">
                    {" "}
                    simple.
                  </span>
                </h2>
              </div>

              <p className="max-w-md text-sm leading-7 text-slate-500 md:justify-self-end md:text-base">
                Everything you need to know, from the moment your order is
                confirmed to the moment it arrives.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => {
                const Icon = section.icon;

                return (
                  <article
                    key={section.num}
                    className="group relative flex h-full min-h-[19rem] flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_55px_-35px_rgba(23,55,111,0.35)] sm:p-7"
                  >
                    <div className="flex items-start justify-between">
                      <div className="grid size-12 place-items-center rounded-2xl bg-[#eef4ff] text-[#2857a1] transition duration-300 group-hover:bg-[#17376f] group-hover:text-white">
                        <Icon size={21} strokeWidth={1.7} />
                      </div>

                      <span className="font-mono text-xs tracking-widest text-slate-300">
                        {section.num} / 06
                      </span>
                    </div>

                    <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.2em] text-blue-700">
                      {section.subtitle}
                    </p>

                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#10213c]">
                      {section.title}
                    </h3>

                    <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
                      {section.content}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-500">
                        <CheckCircle2 size={14} className="text-blue-700" />
                        Shipping information
                      </span>

                      <ArrowUpRight
                        size={16}
                        className="text-slate-300 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-700"
                      />
                    </div>

                    <div className="pointer-events-none absolute -bottom-14 -right-12 size-36 rounded-full bg-blue-50/70 transition-transform duration-500 group-hover:scale-125" />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* CUSTOMER SUPPORT */}
        <section className="bg-white py-16 sm:py-20 md:py-24">
          <div className="wrap">
            <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#11294f] px-6 py-10 sm:px-10 sm:py-14 md:px-14 md:py-16">
              <div className="pointer-events-none absolute -right-20 -top-24 -z-10 size-80 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-4 -top-8 -z-10 size-52 rounded-full border border-white/[0.08]" />
              <div className="pointer-events-none absolute -bottom-28 -left-16 -z-10 size-72 rounded-full bg-blue-400/10 blur-2xl" />

              <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-blue-200">
                    <Headphones size={15} />
                    Personal support
                  </div>

                  <h2 className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl">
                    Need a hand with your delivery?
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/70 sm:text-base">
                    Questions about a shipment, tracking number, or delivery
                    issue? Our team is here to help you find the next step.
                  </p>

                  <p className="mt-5 text-sm text-blue-100/80">
                    Email us at{" "}
                    <a
                      href="mailto:accurateliquid@gmail.com"
                      className="font-semibold text-white underline decoration-blue-300 underline-offset-4 transition hover:text-blue-200"
                    >
                      accurateliquid@gmail.com
                    </a>
                  </p>
                </div>

                <a
                  href="mailto:accurateliquid@gmail.com?subject=Shipping%20and%20Delivery%20Enquiry"
                  className="group inline-flex w-fit items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#17376f] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-50"
                >
                  Contact support
                  <ArrowUpRight
                    size={17}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </div>
            </div>

            <p className="mt-7 text-center text-xs leading-6 text-slate-400">
              Delivery estimates are indicative and may vary by location,
              courier availability, and circumstances beyond our control.
            </p>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
