import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  Droplets,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

const TRUST_PILLARS = [
  {
    icon: Truck,
    title: "Free Shipping in India",
    description: "Prompt dispatch from our Surat facility",
  },
  {
    icon: ShieldCheck,
    title: "ISO 9001:2015 Certified",
    description: "Consistent quality in every single batch",
  },
  {
    icon: Droplets,
    title: "Concentrated Care",
    description: "Tough on stains, gentle on fabrics & skin",
  },
  {
    icon: Sparkles,
    title: "Direct from Surat",
    description: "Crafted locally with honest ingredients",
  },
];

const EXPLORE_LINKS = [
  { href: "/shop", label: "Shop All Products" },
  { href: "/categories", label: "Product Categories" },
  { href: "/about", label: "Our Brand Story" },
  { href: "/faq", label: "Frequently Asked Questions" },
];

const SUPPORT_LINKS = [
  { href: "/orders", label: "Track My Order" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/return-refund-policy", label: "Returns & Refund Policy" },
  { href: "/shipping-returns", label: "Delivery & Returns Overview" },
  { href: "/contact", label: "Help & Support" },
];

export function Footer() {
  return (
    <footer className="limewash-panel relative border-t border-slate-200/90 text-[#0e1117]">
      {/* =========================================================
          PRE-FOOTER TRUST VALUE BAR
      ========================================================= */}
      <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur-xs">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16 py-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="group flex items-center gap-4 rounded-xl border border-transparent p-2 transition-colors hover:border-slate-200/60 hover:bg-white/80"
                >
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf2fe] text-[#244892] shadow-xs transition-transform duration-300 group-hover:scale-105">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#0e1117] leading-snug">
                      {pillar.title}
                    </p>
                    <p className="text-xs text-[#244892] leading-snug mt-0.5">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN FOOTER GRID
      ========================================================= */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-16 py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          {/* -----------------------------------------------------
              COLUMN 1: BRAND IDENTITY (4 COLS)
          ----------------------------------------------------- */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              aria-label="Accurate Liquid Home"
              className="inline-block transition-transform duration-300 hover:scale-[1.02]"
            >
              <Image
                src="/logo.png"
                alt="Accurate Liquid"
                width={200}
                height={100}
                priority
                className="h-[102px] w-auto object-contain"
              />
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#244892]">
              Better basics for everyday living. Thoughtfully formulated in
              Varachha, Surat with an honest commitment to cleaner spaces and
              gentle fabric care.
            </p>

            {/* Trust stats pills */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0e1117] shadow-xs">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Est. 2019
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#244892] shadow-xs">
                <ShieldCheck size={12} />
                ISO 9001:2015
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#da3f51] shadow-xs">
                Made in Surat
              </span>
            </div>

            <p className="mt-5 text-xs text-[#9ca3af] leading-relaxed">
              High-efficiency liquid detergents, surface cleaners, and fabric
              care essentials engineered for Indian homes.
            </p>
          </div>

          {/* -----------------------------------------------------
              COLUMN 2: EXPLORE (2 COLS)
          ----------------------------------------------------- */}
          <div className="lg:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#244892] mb-5">
              Explore
            </p>
            <ul className="space-y-3.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#244892] transition-colors duration-200 hover:text-[#0e1117] hover:underline hover:underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* -----------------------------------------------------
              COLUMN 3: SUPPORT & POLICIES (3 COLS)
          ----------------------------------------------------- */}
          <div className="lg:col-span-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#244892] mb-5">
              Customer Care
            </p>
            <ul className="space-y-3.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#244892] transition-colors duration-200 hover:text-[#0e1117] hover:underline hover:underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* -----------------------------------------------------
              COLUMN 4: CONTACT & FACILITY (3 COLS)
          ----------------------------------------------------- */}
          <div className="lg:col-span-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#244892] mb-5">
              Contact &amp; Works
            </p>
            <div className="space-y-3.5">
              <a
                href="mailto:hello@accurateliquid.in"
                className="group flex items-start gap-3 text-xs text-[#244892] transition-colors hover:text-[#244892]"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white border border-slate-200 text-[#244892] shadow-xs group-hover:border-[#244892]/40 group-hover:bg-[#edf2fe] transition-colors">
                  <Mail size={14} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <span className="block font-semibold text-[#0e1117] group-hover:text-[#244892] transition-colors">
                    hello@accurateliquid.in
                  </span>
                  <span className="text-[11px] text-[#9ca3af]">
                    Direct support &amp; inquiries
                  </span>
                </div>
              </a>

              <div className="flex items-start gap-3 text-xs text-[#244892]">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white border border-slate-200 text-[#244892] shadow-xs">
                  <MapPin size={14} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <span className="block font-semibold text-[#0e1117]">
                    Manufacturing Facility
                  </span>
                  <span className="text-[11px] leading-relaxed text-[#244892]">
                    Varachha, Surat, Gujarat 395006, India
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-[#244892]">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white border border-slate-200 text-[#244892] shadow-xs">
                  <Clock size={14} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <span className="block font-semibold text-[#0e1117]">
                    Working Hours
                  </span>
                  <span className="text-[11px] text-[#244892]">
                    Mon – Sat: 9:00 AM – 7:00 PM IST
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200/80">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#244892] transition-colors hover:text-[#1b3773]"
              >
                <span>Write to our support team</span>
                <ArrowRight
                  size={12}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          BOTTOM LEGAL & ATTRIBUTION BAR
      ========================================================= */}
      <div className="border-t border-slate-200/80 bg-white/50 backdrop-blur-xs">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-5 sm:px-8 lg:px-12 xl:px-16 py-5 text-xs text-[#244892] md:flex-row">
          <div>
            <p>
              © {new Date().getFullYear()} Accurate Liquid. All rights reserved.
              Crafted thoughtfully by{" "}
              <a
                href="https://www.codespire.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#244892] hover:underline"
              >
                Codespire Technologies
              </a>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-[#0e1117] hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-[#0e1117] hover:underline"
            >
              Terms of Service
            </Link>
            <Link
              href="/shipping-policy"
              className="transition-colors hover:text-[#0e1117] hover:underline"
            >
              Shipping Policy
            </Link>
            <Link
              href="/return-refund-policy"
              className="transition-colors hover:text-[#0e1117] hover:underline"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
