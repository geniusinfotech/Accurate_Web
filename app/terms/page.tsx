import { PageFrame } from '@/components/storefront'
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms & Conditions",
  description: "Terms and conditions for using the Accurate Liquid website and purchasing our products.",
  path: "/terms",
});

const sections = [
  {
    num: '01',
    title: 'Acceptance of terms',
    content:
      'By accessing and using the Accurate Liquid website, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our website or services.',
  },
  {
    num: '02',
    title: 'Products & pricing',
    content:
      'All product descriptions and prices on our website are as accurate as possible. We reserve the right to modify prices, discontinue products, or correct any errors without prior notice. Prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.',
  },
  {
    num: '03',
    title: 'Orders & payment',
    content:
      'When you place an order, you are making an offer to purchase. We reserve the right to accept or decline any order. Payment must be completed at the time of purchase through the payment methods available on our website. Orders are confirmed only after successful payment.',
  },
  {
    num: '04',
    title: 'Intellectual property',
    content:
      'All content on this website — including logos, product images, text, and design — is the property of Accurate Liquid and is protected under applicable intellectual property laws. You may not reproduce, distribute, or use any content without our written permission.',
  },
  {
    num: '05',
    title: 'Limitation of liability',
    content:
      'Accurate Liquid shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability for any claim shall not exceed the amount paid for the specific product in question.',
  },
  {
    num: '06',
    title: 'Governing law',
    content:
      'These terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Surat, Gujarat, India.',
  },
]

export default function Terms() {
  return (
    <PageFrame>
      <main className="inner-page wrap policy-page">
        <p className="eyebrow">legal information</p>
        <h1>
          Terms &amp;<br />
          <em>conditions.</em>
        </h1>
        <p className="page-intro">
          Please read these terms carefully before using our website or placing an order. By using our services, you agree to the following terms.
        </p>
        <section className="policy-grid">
          {sections.map((s) => (
            <article key={s.num}>
              <span>{s.num}</span>
              <h2>{s.title}</h2>
              <p>{s.content}</p>
            </article>
          ))}
        </section>
        <p className="policy-update-note">
          Last updated: October 2026. We reserve the right to update these terms at any time. Continued use of our website constitutes acceptance of any changes.
        </p>
      </main>
    </PageFrame>
  )
}
