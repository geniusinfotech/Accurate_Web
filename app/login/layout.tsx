import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Login",
  description:
    "Sign in to your Accurate Liquid account.",
  path: "/login",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
