import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageFrame } from '@/components/storefront'
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Shipping & Returns",
  description: "Shipping and returns information for Accurate Liquid orders across India.",
  path: "/shipping-returns",
});

export default function ShippingReturns() {
  return (
    <PageFrame>
      <main className="inner-page wrap policy-page">
        <p className="eyebrow">the practical bits</p>
        <h1>
          Shipping &amp;<br />
          <em>returns.</em>
        </h1>
        <p className="page-intro">Clear, simple information for a smooth order from our home to yours.</p>
        <section className="policy-grid">
          <article>
            <span>01</span>
            <h2>Shipping</h2>
            <p>Orders are packed with care and dispatched across India. You&apos;ll receive tracking details as soon as your order is on its way.</p>
            <Link href="/shipping-policy" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#244892] underline">
              Read complete Shipping Policy <ArrowRight size={13} />
            </Link>
          </article>
          <article>
            <span>02</span>
            <h2>Returns</h2>
            <p>Changed your mind? Contact us within 7 days of delivery. Products must be unopened and in their original condition.</p>
            <Link href="/return-refund-policy" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#244892] underline">
              Read Return &amp; Refund Policy <ArrowRight size={13} />
            </Link>
          </article>
          <article>
            <span>03</span>
            <h2>Damaged orders</h2>
            <p>If something arrives damaged, send us a photo within 48 hours and we&apos;ll make it right with an immediate replacement or full refund.</p>
            <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#244892] underline">
              Contact Support <ArrowRight size={13} />
            </Link>
          </article>
        </section>
      </main>
    </PageFrame>
  )
}
