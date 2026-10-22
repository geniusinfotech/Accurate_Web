import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "Accurate Liquid and Umiyadham make certified-quality home care products in Varachha, Surat. Learn our story and commitment to better formulas.",
  path: "/about",
  keywords: ["about Accurate Liquid", "detergent manufacturer Surat", "Umiyadham products"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
