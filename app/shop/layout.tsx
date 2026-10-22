import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Shop Liquid Detergent & Cleaning Products",
  description:
    "Browse Accurate Liquid detergents, dishwash liquids, floor cleaners, toilet cleaners and hand wash. Best prices, fast delivery across India.",
  path: "/shop",
  keywords: ["buy detergent online", "liquid detergent price", "cleaning products shop"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
