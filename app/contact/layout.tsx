import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Accurate Liquid for orders, bulk and dealer enquiries, or product support. We're based in Surat, Gujarat.",
  path: "/contact",
  keywords: ["contact Accurate Liquid", "detergent dealer enquiry", "bulk detergent supplier Surat"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
