"use client";

import { useState } from "react";
import Link from "next/link";
import { PageFrame } from "@/components/storefront";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Droplets,
  Mail,
  MessageCircle,
  Sparkles,
} from "lucide-react";

const faqs = [
  {
    category: "Products & Care",
    question: "Are Accurate products suitable for sensitive skin?",
    answer:
      "Our formulas are made to be effective and considerate. Check each product label for specific ingredients and suitability information. If you have sensitive skin, review the ingredients carefully before use.",
  },
  {
    category: "Our Brand",
    question: "Where are your products made?",
    answer:
      "Our products are proudly made in Varachha, Surat, Gujarat, India. We are focused on bringing dependable cleaning products into everyday homes.",
  },
  {
    category: "Products & Care",
    question: "Can I reuse the refill pouches?",
    answer:
      "Our refill packs are designed to make topping up your bottles simple. Follow the instructions on the individual packaging, and reuse your main bottle whenever it is suitable and in good condition.",
  },
  {
    category: "Orders & Support",
    question: "How do I contact customer support?",
    answer:
      "You can reach our team at accurateliquid@gmail.com for product questions and other enquiries. Include your question and relevant order details, if applicable, so we can assist you.",
  },
];

const categories = [
  "All questions",
  "Products & Care",
  "Our Brand",
  "Orders & Support",
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("All questions");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs =
    activeCategory === "All questions"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <PageFrame>
      <main className="overflow-hidden bg-white text-[#14233b]">
        {/* HERO */}
        <section className="relative isolate overflow-hidden bg-[#f1f6ff]">
          <div className="pointer-events-none absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-0 -z-10 size-80 rounded-full bg-cyan-100/60 blur-3xl" />

          <div className="wrap">
            <div className="grid items-center gap-10 py-16 sm:py-20 md:grid-cols-[1fr_0.65fr] md:py-24 lg:gap-20">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2">
                  <CircleHelp size={15} className="text-[#315db0]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#315db0]">
                    Here to help
                  </span>
                </div>

                <h1 className="mt-7 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                  Good questions.
                  <span className="mt-2 block font-serif font-normal italic text-[#315db0]">
                    Clear answers.
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-8 text-slate-600 sm:text-lg">
                  Everything you need to know about Accurate products, our
                  brand, and getting in touch with our team.
                </p>

                <a
                  href="#faq-questions"
                  className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#19366f] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-[#244892]"
                >
                  Find your answer
                  <ArrowDownRight
                    size={17}
                    className="transition-transform group-hover:translate-y-0.5"
                  />
                </a>
              </div>

              <div className="relative mx-auto w-full max-w-sm">
                <div className="relative overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-white via-[#e9f1ff] to-[#dce9ff] p-8 shadow-xl shadow-blue-900/5 sm:p-10">
                  <div className="absolute -right-12 -top-12 size-40 rounded-full border border-blue-200/70" />
                  <div className="absolute -right-5 -top-5 size-28 rounded-full border border-blue-200/70" />

                  <div className="relative">
                    <div className="grid size-16 place-items-center rounded-2xl bg-[#19366f] text-white shadow-lg shadow-blue-900/15">
                      <MessageCircle size={29} strokeWidth={1.6} />
                    </div>

                    <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-[#315db0]">
                      A little help goes a long way
                    </p>

                    <h2 className="mt-3 font-serif text-3xl leading-tight text-[#14233b]">
                      Let&apos;s make things simple.
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      Can&apos;t find what you are looking for? We&apos;re just
                      an email away.
                    </p>

                    <a
                      href="mailto:accurateliquid@gmail.com"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#315db0] hover:text-[#14233b]"
                    >
                      Contact our team
                      <ArrowUpRight size={16} />
                    </a>
                  </div>

                  <Sparkles
                    size={25}
                    className="absolute bottom-8 right-8 text-blue-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ CONTENT */}
        <section
          id="faq-questions"
          className="scroll-mt-24 py-16 sm:py-20 md:py-24"
        >
          <div className="wrap">
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#315db0]">
                  Frequently asked questions
                </span>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#14233b] sm:text-4xl">
                  What would you like to know?
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                  Browse the topics below to find the information you need.
                </p>
              </div>

              {/* Category filters */}
              <div className="mt-9 flex flex-wrap justify-center gap-2">
                {categories.map((category) => {
                  const selected = activeCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setActiveCategory(category);
                        setOpenIndex(0);
                      }}
                      aria-pressed={selected}
                      className={`rounded-full border px-4 py-2.5 text-xs font-semibold transition-all sm:px-5 sm:text-sm ${
                        selected
                          ? "border-[#19366f] bg-[#19366f] text-white shadow-md shadow-blue-900/10"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-[#315db0]"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {/* Accordion */}
              <div className="mt-9 space-y-3">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = openIndex === index;

                  return (
                    <article
                      key={faq.question}
                      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                        isOpen
                          ? "border-blue-200 bg-[#f8faff] shadow-md shadow-blue-900/[0.04]"
                          : "border-slate-200 bg-white hover:border-blue-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-7 sm:py-6"
                      >
                        <span
                          className={`grid size-10 shrink-0 place-items-center rounded-xl transition-colors ${
                            isOpen
                              ? "bg-[#19366f] text-white"
                              : "bg-blue-50 text-[#315db0]"
                          }`}
                        >
                          {isOpen ? (
                            <CheckCircle2 size={19} />
                          ) : (
                            <CircleHelp size={19} />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.18em] text-[#5277b8]">
                            {faq.category}
                          </span>
                          <span className="block text-sm font-semibold leading-6 text-[#14233b] sm:text-base">
                            {faq.question}
                          </span>
                        </span>

                        <span
                          className={`grid size-8 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                            isOpen
                              ? "rotate-180 bg-blue-100 text-[#19366f]"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <ChevronDown size={17} />
                        </span>
                      </button>

                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="ml-[4.5rem] mr-5 border-t border-blue-100 pb-6 pt-4 sm:ml-[5.75rem] sm:mr-7">
                            <p className="text-sm leading-7 text-slate-600">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <p className="mt-6 text-center text-xs text-slate-400">
                Showing {filteredFaqs.length}{" "}
                {filteredFaqs.length === 1 ? "question" : "questions"}
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="bg-[#f7f9fd] py-16 sm:py-20">
          <div className="wrap">
            <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#142c54] px-6 py-12 text-center sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute -right-16 -top-20 -z-10 size-64 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 -z-10 size-64 rounded-full bg-blue-400/10 blur-2xl" />

              <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/10 text-blue-200">
                <Mail size={25} />
              </div>

              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-blue-300">
                Still have questions?
              </p>

              <h2 className="mx-auto mt-4 max-w-xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
                We&apos;re happy to help.
              </h2>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-blue-100/70 sm:text-base">
                Reach out to our team for product information or any other
                questions about Accurate.
              </p>

              <a
                href="mailto:accurateliquid@gmail.com"
                className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-semibold text-[#19366f] transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                accurateliquid@gmail.com
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
