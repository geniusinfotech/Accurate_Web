import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "My Profile",
  description:
    "Manage your Accurate Liquid account.",
  path: "/profile",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
