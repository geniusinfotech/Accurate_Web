import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "My Orders",
  description:
    "View your Accurate Liquid orders.",
  path: "/orders",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
