import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Shop by Category",
  description:
    "Explore Accurate Liquid categories: laundry care, dish care, surface care, toilet cleaners and personal care.",
  path: "/categories",
  keywords: ["laundry care", "dish care", "surface cleaner", "personal care"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
