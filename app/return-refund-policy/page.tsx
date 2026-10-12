import { PageFrame } from '@/components/storefront'

const sections = [
  {
    num: '01',
    title: 'Return eligibility',
    content:
      'Products may be returned within 7 days of delivery. To be eligible for a return, items must be unused, unopened, and in their original packaging. Products that have been opened, used, or damaged by the customer are not eligible for returns.',
  },
  {
    num: '02',
    title: 'How to initiate a return',
    content:
      'To request a return, email us at hello@accurateliquid.in with your order number, the product you wish to return, and the reason for the return. Our team will review your request and respond within 2 business days with instructions.',
  },
  {
    num: '03',
    title: 'Return shipping',
    content:
      'Return shipping costs are the responsibility of the customer unless the product was received damaged or defective. Please ensure the product is securely packed to prevent damage during transit. We recommend using a trackable shipping method.',
  },
  {
    num: '04',
    title: 'Refund process',
    content:
      'Once we receive and inspect the returned product, we will notify you of the approval or rejection of your refund. Approved refunds will be processed within 5–7 business days and credited to your original payment method.',
  },
  {
    num: '05',
    title: 'Damaged or defective products',
    content:
      'If you receive a damaged or defective product, contact us within 48 hours of delivery with photographs of the damage. We will arrange a replacement or full refund at no additional cost to you.',
  },
  {
    num: '06',
    title: 'Exchanges',
    content:
      'We currently do not offer direct exchanges. If you would like a different product, please initiate a return for the original item and place a new order. For any questions, our team is happy to help at hello@accurateliquid.in.',
  },
]

export default function ReturnRefundPolicy() {
  return (
    <PageFrame>
      <main className="inner-page wrap policy-page">
        <p className="eyebrow">hassle-free returns</p>
        <h1>
          Return &amp; refund<br />
          <em>policy.</em>
        </h1>
        <p className="page-intro">
          We want you to be completely happy with your purchase. If something isn&apos;t right, here&apos;s how we make it easy to return or get a refund.
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
          Last updated: October 2026. For any return or refund queries, contact us at hello@accurateliquid.in.
        </p>
      </main>
    </PageFrame>
  )
}
