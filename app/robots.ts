import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/cart", "/checkout", "/profile", "/orders", "/login", "/signup", "/auth"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
