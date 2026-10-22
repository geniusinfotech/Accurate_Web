import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Shipping Policy",
  description:
    "Delivery timelines, shipping charges and coverage for Accurate Liquid orders across India.",
  path: "/shipping-policy",
  keywords: ["shipping policy", "delivery charges"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
