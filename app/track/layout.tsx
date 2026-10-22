import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Track Your Order",
  description:
    "Track your Accurate Liquid order status and shipment in real time.",
  path: "/track",
  keywords: ["track order", "order status"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
