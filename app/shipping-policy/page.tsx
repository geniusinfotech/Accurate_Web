import { PageFrame } from '@/components/storefront'

const sections = [
  {
    num: '01',
    title: 'Shipping coverage',
    content:
      'We currently ship across India. Orders are dispatched from our facility in Surat, Gujarat. Delivery timelines may vary depending on your location and the shipping method selected at checkout.',
  },
  {
    num: '02',
    title: 'Processing time',
    content:
      'Orders are processed within 1–2 business days after payment confirmation. During sales or festive seasons, processing may take an additional 1–2 business days. You will receive an email confirmation once your order has been dispatched.',
  },
  {
    num: '03',
    title: 'Delivery timelines',
    content:
      'Standard delivery typically takes 4–7 business days depending on your location. Metro cities may receive orders sooner. Remote or rural areas may take up to 10 business days. These timelines are estimates and may vary due to factors beyond our control.',
  },
  {
    num: '04',
    title: 'Shipping charges',
    content:
      'Shipping charges are calculated at checkout based on order weight and delivery location. We may offer free shipping on orders above a certain value — details will be displayed on the website and at checkout.',
  },
  {
    num: '05',
    title: 'Order tracking',
    content:
      'Once your order is dispatched, you will receive a tracking number via email or SMS. You can track your order status on our website or through the courier partner\'s tracking page.',
  },
  {
    num: '06',
    title: 'Delivery issues',
    content:
      'If your order is delayed, lost, or damaged during transit, please contact us at hello@accurateliquid.in within 48 hours of the expected delivery date. We will work with our shipping partner to resolve the issue promptly.',
  },
]

export default function ShippingPolicy() {
  return (
    <PageFrame>
      <main className="inner-page wrap policy-page">
        <p className="eyebrow">delivery information</p>
        <h1>
          Shipping<br />
          <em>policy.</em>
        </h1>
        <p className="page-intro">
          We pack every order with care and ship it to your doorstep as quickly as possible. Here&apos;s everything you need to know about our shipping process.
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
          For specific questions about your delivery, reach out to us at hello@accurateliquid.in.
        </p>
      </main>
    </PageFrame>
  )
}
