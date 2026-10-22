import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Signing in",
  description:
    "Signing in to Accurate Liquid.",
  path: "/auth",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
