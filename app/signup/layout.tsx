import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Create Account",
  description:
    "Create your Accurate Liquid account.",
  path: "/signup",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
