import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Checkout",
  description:
    "Complete your Accurate Liquid order securely.",
  path: "/checkout",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
