import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Answers to common questions about Accurate Liquid products, orders, payment, shipping and returns.",
  path: "/faq",
  keywords: ["Accurate Liquid FAQ", "detergent usage questions"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
