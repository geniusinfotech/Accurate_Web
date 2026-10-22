"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { PageFrame } from "@/components/storefront";
import { apiRequest } from "@/lib/api-client";
import { isValidPhone } from "@/lib/checkout";

const EMAIL = "accurateliquid@gmail.com";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const cleanPhone = formData.phone.trim().replace(/\D/g, "");

    if (!isValidPhone(cleanPhone)) {
      setError(
        "Please enter a valid 10-digit phone number starting with 6, 7, 8, or 9.",
      );
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: cleanPhone,
          subject: formData.subject.trim() || "General Inquiry",
          message: formData.message.trim(),
        }),
      });

      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send your message. Please try again or email us directly.",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof initialFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (error) {
      setError("");
    }
  };

  return (
    <PageFrame>
      <main className="min-h-screen overflow-hidden bg-[#f3f7ff] text-[#172b4d]">
        {/* Hero */}
        <section className="relative border-b border-[#e0e9f8]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#dce8ff] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-white blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 md:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfddf5] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#315db0]">
                <Sparkles size={14} />
                We&apos;d love to hear from you
              </div>

              <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-7xl">
                Good things
                <span className="block text-[#4774c7]">
                  start with a hello.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-[#647590] sm:text-lg">
                Have a question about our products, need help with an order, or
                interested in working with us? Tell us what you need. We&apos;re
                here to help.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#contact-form"
                  className="inline-flex items-center gap-2 rounded-full bg-[#193b78] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#193b78]/15 transition hover:-translate-y-0.5 hover:bg-[#244d94]"
                >
                  Send us a message
                  <ArrowRight size={17} />
                </a>

                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d2def1] bg-white px-6 py-3.5 text-sm font-semibold text-[#24416f] transition hover:border-[#9db8e8]"
                >
                  Email us directly
                  <ArrowUpRight size={16} />
                </a>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#647590]">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#4774c7]" />
                  Product enquiries
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#4774c7]" />
                  Order support
                </span>
              </div>
            </div>

            {/* Decorative contact card */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute inset-5 rounded-[2.5rem] bg-[#dce7fb] blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-6 shadow-2xl shadow-[#17376d]/10 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#6e83a7]">
                      Accurate Liquid
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      Let&apos;s talk.
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#75839a]">
                      Your questions and feedback matter to us.
                    </p>
                  </div>

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eaf1ff] text-[#315db0]">
                    <MessageCircle size={27} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="group flex items-center gap-4 rounded-2xl border border-[#e7edf8] p-4 transition hover:border-[#c6d7f3] hover:bg-[#f8faff]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#315db0]">
                      <Mail size={21} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#7a89a1]">Email us</p>
                      <p className="mt-1 break-all text-sm font-semibold text-[#203656]">
                        {EMAIL}
                      </p>
                    </div>
                    <ArrowUpRight
                      size={17}
                      className="shrink-0 text-[#8b9ab1] transition group-hover:text-[#315db0]"
                    />
                  </a>

                  <div className="flex items-center gap-4 rounded-2xl border border-[#e7edf8] p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#315db0]">
                      <MapPin size={21} />
                    </div>
                    <div>
                      <p className="text-xs text-[#7a89a1]">Our location</p>
                      <p className="mt-1 text-sm font-semibold text-[#203656]">
                        Varachha, Surat
                      </p>
                      <p className="mt-1 text-xs text-[#7a89a1]">
                        Gujarat, India
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex gap-3 rounded-2xl bg-[#f2f6ff] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#315db0]">
                    <ShieldCheck size={21} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#203656]">
                      We value your feedback
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#75839a]">
                      Every message helps us serve you better.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact form and details */}
        <section
          id="contact-form"
          className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
        >
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4774c7]">
              Get in touch
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              How can we help you?
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#6c7b93] sm:text-base">
              Fill in the details below and send us your message. Please include
              your order number if your enquiry is about an existing order.
            </p>
          </div>

          <div className="grid items-start gap-7 lg:grid-cols-[1.4fr_0.6fr]">
            {/* Form panel */}
            <div className="rounded-[1.75rem] border border-[#dfe8f8] bg-white p-5 shadow-sm shadow-[#17376d]/[0.03] sm:p-8 lg:p-10">
              {submitted ? (
                <div className="flex min-h-[430px] flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={43} strokeWidth={1.7} />
                  </div>

                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                    Message submitted
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#203656]">
                    Thank you, {formData.name}!
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-7 text-[#6c7b93]">
                    Your message has been submitted successfully. Our team can
                    follow up using{" "}
                    <strong className="text-[#203656]">{formData.email}</strong>{" "}
                    or{" "}
                    <strong className="text-[#203656]">{formData.phone}</strong>
                    .
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData(initialFormData);
                      setError("");
                    }}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#193b78] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#244d94]"
                  >
                    <Send size={16} />
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="mb-7 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf1ff] text-[#315db0]">
                      <Send size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#203656]">
                        Write to our team
                      </h3>
                      <p className="mt-1 text-xs text-[#7a89a1]">
                        Fields marked * are required
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                    >
                      <span className="mt-0.5 shrink-0">!</span>
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#304563]">
                        Full name <span className="text-[#4774c7]">*</span>
                      </span>
                      <input
                        name="name"
                        autoComplete="name"
                        required
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="w-full rounded-xl border border-[#dce5f3] bg-[#fbfcff] px-4 py-3.5 text-sm text-[#203656] outline-none transition placeholder:text-[#a0acc0] focus:border-[#6d91d5] focus:bg-white focus:ring-4 focus:ring-[#315db0]/10"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#304563]">
                        Email address <span className="text-[#4774c7]">*</span>
                      </span>
                      <input
                        name="email"
                        autoComplete="email"
                        required
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="w-full rounded-xl border border-[#dce5f3] bg-[#fbfcff] px-4 py-3.5 text-sm text-[#203656] outline-none transition placeholder:text-[#a0acc0] focus:border-[#6d91d5] focus:bg-white focus:ring-4 focus:ring-[#315db0]/10"
                      />
                    </label>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#304563]">
                        Phone number <span className="text-[#4774c7]">*</span>
                      </span>
                      <div className="relative">
                        <Phone
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a9ab4]"
                        />
                        <input
                          name="phone"
                          autoComplete="tel-national"
                          required
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          pattern="[6-9][0-9]{9}"
                          title="Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={(e) => {
                            const digits = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);
                            updateField("phone", digits);
                          }}
                          className="w-full rounded-xl border border-[#dce5f3] bg-[#fbfcff] py-3.5 pl-11 pr-4 text-sm text-[#203656] outline-none transition placeholder:text-[#a0acc0] focus:border-[#6d91d5] focus:bg-white focus:ring-4 focus:ring-[#315db0]/10"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#304563]">
                        Subject
                      </span>
                      <input
                        name="subject"
                        placeholder="What is your enquiry about?"
                        value={formData.subject}
                        onChange={(e) => updateField("subject", e.target.value)}
                        className="w-full rounded-xl border border-[#dce5f3] bg-[#fbfcff] px-4 py-3.5 text-sm text-[#203656] outline-none transition placeholder:text-[#a0acc0] focus:border-[#6d91d5] focus:bg-white focus:ring-4 focus:ring-[#315db0]/10"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#304563]">
                      Your message <span className="text-[#4774c7]">*</span>
                    </span>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      className="w-full resize-y rounded-xl border border-[#dce5f3] bg-[#fbfcff] px-4 py-3.5 text-sm leading-7 text-[#203656] outline-none transition placeholder:text-[#a0acc0] focus:border-[#6d91d5] focus:bg-white focus:ring-4 focus:ring-[#315db0]/10"
                    />
                  </label>

                  <div className="flex flex-col gap-4 border-t border-[#edf1f8] pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-sm text-xs leading-5 text-[#8290a5]">
                      Your details will be used to respond to your enquiry.
                    </p>

                    <button
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#193b78] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#193b78]/10 transition hover:-translate-y-0.5 hover:bg-[#244d94] disabled:cursor-not-allowed disabled:opacity-60"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Sending message...
                        </>
                      ) : (
                        <>
                          Send message
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Contact information */}
            <aside className="space-y-5">
              <div className="rounded-[1.75rem] border border-[#dfe8f8] bg-white p-6 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4774c7]">
                  Contact information
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#203656]">
                  We&apos;re listening.
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#74839a]">
                  Reach out for product information, order assistance, wholesale
                  enquiries, or feedback.
                </p>

                <div className="mt-7 space-y-5">
                  <a
                    href={`mailto:${EMAIL}`}
                    className="group flex items-start gap-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#315db0] transition group-hover:bg-[#315db0] group-hover:text-white">
                      <Mail size={20} />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-xs text-[#8290a5]">Email address</p>
                      <p className="mt-1 break-all text-sm font-semibold text-[#203656] group-hover:text-[#315db0]">
                        {EMAIL}
                      </p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#315db0]">
                      <MapPin size={20} />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-xs text-[#8290a5]">Location</p>
                      <p className="mt-1 text-sm font-semibold text-[#203656]">
                        Varachha, Surat
                      </p>
                      <p className="mt-1 text-sm text-[#74839a]">
                        Gujarat, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.75rem] bg-[#18366c] p-6 text-white sm:p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                  <Clock3 size={23} />
                </div>
                <h3 className="mt-5 text-xl font-semibold">
                  Every enquiry matters.
                </h3>
                <p className="mt-3 text-sm leading-7 text-blue-100/75">
                  Send us your question with the relevant details so our team
                  can better understand how to assist you.
                </p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:gap-3"
                >
                  Email customer support
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </aside>
          </div>
        </section>

        {/* Bottom reassurance */}
        <section className="border-t border-[#dfe8f8] bg-white/70">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#315db0]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#203656]">
                  Have a question? Start here.
                </p>
                <p className="mt-1 text-xs text-[#8290a5]">
                  We&apos;re happy to hear from you.
                </p>
              </div>
            </div>

            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#315db0] hover:text-[#193b78]"
            >
              {EMAIL}
              <ArrowUpRight size={15} />
            </a>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
