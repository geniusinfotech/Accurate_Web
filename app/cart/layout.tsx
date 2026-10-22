import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Your Cart",
  description:
    "Review the products in your Accurate Liquid cart.",
  path: "/cart",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
