import type { MetadataRoute } from "next";
import { getServerApiClientInstance } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const PAGES = ["", "/shop", "/categories", "/about", "/contact", "/faq", "/track", "/shipping-policy", "/return-refund-policy", "/privacy-policy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = PAGES.map((p) => ({ url: `${SITE_URL}${p}` }));
  try {
    // ponytail: first 50 products only (API cap); page through if the catalog outgrows it.
    const api = await getServerApiClientInstance();
    const res: any = await api.get("/products?status=published&isActive=true&limit=50");
    const items: any[] = res?.items || res?.products || [];
    return [
      ...pages,
      ...items.map((p) => ({ url: `${SITE_URL}/product/${p._id || p.id}`, lastModified: p.updatedAt })),
    ];
  } catch {
    return pages;
  }
}
