import Link from "next/link";
import { PageFrame } from "@/components/storefront";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Headphones,
  Package,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Truck,
} from "lucide-react";

const sections = [
  {
    num: "01",
    title: "Return eligibility",
    icon: PackageCheck,
    tag: "Before you return",
    content:
      "Products may be returned within 7 days of delivery. To be eligible for a return, items must be unused, unopened, and in their original packaging. Products that have been opened, used, or damaged by the customer are not eligible for returns.",
  },
  {
    num: "02",
    title: "How to initiate a return",
    icon: RefreshCw,
    tag: "Start a request",
    content:
      "To request a return, email us at accurateliquid@gmail.com with your order number, the product you wish to return, and the reason for the return. Our team will review your request and respond within 2 business days with instructions.",
  },
  {
    num: "03",
    title: "Return shipping",
    icon: Truck,
    tag: "Shipping information",
    content:
      "Return shipping costs are the responsibility of the customer unless the product was received damaged or defective. Please ensure the product is securely packed to prevent damage during transit. We recommend using a trackable shipping method.",
  },
  {
    num: "04",
    title: "Refund process",
    icon: CreditCard,
    tag: "Your refund",
    content:
      "Once we receive and inspect the returned product, we will notify you of the approval or rejection of your refund. Approved refunds will be processed within 5–7 business days and credited to your original payment method.",
  },
  {
    num: "05",
    title: "Damaged or defective products",
    icon: ShieldCheck,
    tag: "We're here to help",
    content:
      "If you receive a damaged or defective product, contact us within 48 hours of delivery with photographs of the damage. We will arrange a replacement or full refund at no additional cost to you.",
  },
  {
    num: "06",
    title: "Exchanges",
    icon: RefreshCw,
    tag: "Need something else?",
    content:
      "We currently do not offer direct exchanges. If you would like a different product, please initiate a return for the original item and place a new order. For any questions, our team is happy to help at accurateliquid@gmail.com.",
  },
];

const steps = [
  {
    number: "01",
    title: "Contact our team",
    description: "Email your order number and reason for the return.",
  },
  {
    number: "02",
    title: "Get instructions",
    description: "Our team will respond within 2 business days.",
  },
  {
    number: "03",
    title: "Return & inspection",
    description: "Send the eligible item securely packed for inspection.",
  },
  {
    number: "04",
    title: "Receive your refund",
    description: "Approved refunds are processed within 5–7 business days.",
  },
];

export default function ReturnRefundPolicy() {
  return (
    <PageFrame>
      <main className="min-h-screen bg-[#f3f7ff] text-[#172b4d]">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[#dfe8f8]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#dce8ff] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-white blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:py-24 lg:px-12">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfddf5] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#315db0]">
                <RefreshCw size={14} />
                Customer-first support
              </div>

              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-7xl">
                A better experience,
                <span className="mt-1 block text-[#4774c7]">
                  even after checkout.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#60718d] sm:text-lg">
                We want you to feel confident with every Accurate Liquid
                purchase. Here&apos;s what to know about returns, refunds, and
                getting the help you need.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="mailto:accurateliquid@gmail.com?subject=Return%20or%20Refund%20Request"
                  className="inline-flex items-center gap-2 rounded-full bg-[#193b78] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#193b78]/15 transition hover:-translate-y-0.5 hover:bg-[#244d94]"
                >
                  Request a return
                  <ArrowUpRight size={17} />
                </a>
                <a
                  href="#return-process"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d2def1] bg-white px-6 py-3.5 text-sm font-semibold text-[#24416f] transition hover:border-[#9db8e8]"
                >
                  Understand the process
                  <ArrowDownRight size={17} />
                </a>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#61718b]">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#4774c7]" />
                  7-day return window
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#4774c7]" />
                  Clear refund process
                </span>
              </div>
            </div>

            {/* Decorative return illustration */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute inset-5 rounded-[2.5rem] bg-[#dce7fb] blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-6 shadow-2xl shadow-[#17376d]/10 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#6e83a7]">
                      Customer care
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight">
                      Your request, step by step
                    </h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf1ff] text-[#315db0]">
                    <PackageCheck size={25} />
                  </div>
                </div>

                <div className="relative mt-8 space-y-5">
                  <div className="absolute bottom-5 left-[19px] top-5 w-px bg-[#d9e4f6]" />
                  {steps.map((step, index) => (
                    <div key={step.number} className="relative flex gap-4">
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                          index === 0
                            ? "border-[#315db0] bg-[#315db0] text-white"
                            : "border-[#d9e4f6] bg-white text-[#315db0]"
                        }`}
                      >
                        {step.number}
                      </div>
                      <div className="pb-1 pt-0.5">
                        <h3 className="text-sm font-semibold text-[#203656]">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[#75839a]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex items-center gap-3 rounded-2xl bg-[#f2f6ff] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#315db0]">
                    <Clock3 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Need assistance?</p>
                    <p className="mt-1 text-xs leading-5 text-[#75839a]">
                      Our team is ready to help with your request.
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl shadow-[#17376d]/10 sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#315db0]">
                  <ShieldCheck size={21} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Clear guidelines</p>
                  <p className="text-xs text-[#75839a]">Simple & transparent</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key policy details */}
        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#dfe8f8] bg-white p-5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#315db0]">
                <CalendarDaysIcon />
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-tight">
                7 days
              </p>
              <p className="mt-1 text-sm text-[#74839a]">
                Return window from delivery
              </p>
            </div>
            <div className="rounded-2xl border border-[#dfe8f8] bg-white p-5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#315db0]">
                <Clock3 size={22} />
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-tight">
                2 business days
              </p>
              <p className="mt-1 text-sm text-[#74839a]">
                Typical response to a return request
              </p>
            </div>
            <div className="rounded-2xl border border-[#dfe8f8] bg-white p-5 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#315db0]">
                <CreditCard size={22} />
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-tight">
                5–7 days
              </p>
              <p className="mt-1 text-sm text-[#74839a]">
                Refund processing after approval
              </p>
            </div>
          </div>
        </section>

        {/* Policy cards */}
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-12 lg:pb-24">
          <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4774c7]">
                The details
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Return &amp; refund guidelines
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-[#6c7b93] sm:text-base">
              Review each policy before starting your return so you know what to
              expect at every stage.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <article
                  key={section.num}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-[#dfe8f8] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#b9ccef] hover:shadow-xl hover:shadow-[#1d3e78]/[0.06] sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3ff] text-[#315db0] transition group-hover:bg-[#315db0] group-hover:text-white">
                      <Icon size={23} strokeWidth={1.8} />
                    </div>
                    <span className="text-sm font-semibold tracking-[0.15em] text-[#9aacc8]">
                      {section.num}
                    </span>
                  </div>

                  <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.17em] text-[#4774c7]">
                    {section.tag}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#203656]">
                    {section.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-[#6d7c94]">
                    {section.content}
                  </p>

                  <div className="mt-6 border-t border-[#edf1f8] pt-4">
                    <a
                      href="mailto:accurateliquid@gmail.com?subject=Return%20or%20Refund%20Question"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#315db0] transition hover:gap-3"
                    >
                      Ask us a question
                      <ArrowRight size={15} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Support CTA */}
        <section className="px-5 pb-16 sm:px-8 lg:px-12 lg:pb-24">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#18366c] px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-14 h-52 w-52 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-32 right-1/4 h-64 w-64 rounded-full bg-[#4774c7]/20 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                  <Headphones size={14} />
                  Here to help
                </div>
                <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  Have a question about your order?
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/75 sm:text-base">
                  Contact our team with your order details. We&apos;ll help you
                  understand the next steps for your return or refund.
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-3">
                <a
                  href="mailto:accurateliquid@gmail.com?subject=Return%20or%20Refund%20Enquiry"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#193b78] transition hover:-translate-y-0.5 hover:bg-[#edf3ff]"
                >
                  Email customer support
                  <ArrowUpRight size={17} />
                </a>
                <p className="text-xs text-blue-100/70">
                  accurateliquid@gmail.com
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Policy footer */}
        <footer className="border-t border-[#dfe8f8] bg-white/70">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs leading-6 text-[#7b89a0] sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
            <p>
              Last updated: October 2026. Please review the policy before
              submitting a return request.
            </p>
            <a
              href="mailto:accurateliquid@gmail.com"
              className="inline-flex items-center gap-1.5 font-semibold text-[#315db0] hover:text-[#193b78]"
            >
              Contact us
              <ArrowUpRight size={13} />
            </a>
          </div>
        </footer>
      </main>
    </PageFrame>
  );
}

function CalendarDaysIcon() {
  return <Clock3 size={22} />;
}
