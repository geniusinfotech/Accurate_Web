import { PageFrame } from "@/components/storefront";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Accurate Liquid collects, uses and protects your personal information.",
  path: "/privacy-policy",
});

const sections = [
  {
    num: "01",
    title: "Information we collect",
    content:
      "When you place an order, create an account, or contact us, we collect information such as your name, email address, phone number, shipping address, and payment details. We may also collect browsing data through cookies to improve your experience on our website.",
  },
  {
    num: "02",
    title: "How we use your data",
    content:
      "We use your information to process and fulfil orders, communicate updates and shipping notifications, respond to enquiries, improve our website and product offerings, and send marketing communications if you have opted in. We will never sell your personal data to third parties.",
  },
  {
    num: "03",
    title: "Data protection",
    content:
      "Your data is stored securely using industry-standard encryption. We limit access to personal information to employees and partners who need it to provide our services. We retain your information only for as long as necessary to fulfil the purposes outlined in this policy.",
  },
  {
    num: "04",
    title: "Cookies",
    content:
      "Our website uses cookies to remember your preferences, maintain your session, and analyse site traffic. You can manage cookie preferences through your browser settings. Disabling cookies may affect certain features of the website.",
  },
  {
    num: "05",
    title: "Third-party services",
    content:
      "We work with trusted third-party services for payment processing, shipping, and analytics. These partners only receive the data necessary to perform their services and are contractually obligated to protect your information.",
  },
  {
    num: "06",
    title: "Your rights",
    content:
      "You have the right to access, correct, or delete your personal data at any time. To exercise these rights or if you have any questions about how we handle your data, contact us at accurateliquid@gmail.com.",
  },
];

export default function PrivacyPolicy() {
  return (
    <PageFrame>
      <main className="inner-page wrap policy-page">
        <p className="eyebrow">your privacy matters</p>
        <h1>
          Privacy
          <br />
          <em>policy.</em>
        </h1>
        <p className="page-intro">
          We respect your privacy and are committed to protecting the personal
          information you share with us. This policy explains how we collect,
          use, and safeguard your data.
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
          Last updated: October 2026. We may update this policy from time to
          time. Changes will be posted on this page.
        </p>
      </main>
    </PageFrame>
  );
}
