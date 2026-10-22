import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://accurateliquid.com").replace(/\/+$/, "");
export const SITE_NAME = "Accurate Liquid";
export const DEFAULT_OG_IMAGE = "/android-chrome-512x512.png";

export const BASE_KEYWORDS = [
  "Accurate Liquid",
  "Accurate detergent",
  "liquid detergent",
  "washing liquid",
  "laundry liquid",
  "dishwash liquid",
  "floor cleaner",
  "toilet cleaner",
  "hand wash",
  "home cleaning products",
  "cleaning products online India",
  "Umiyadham",
  "made in Surat",
];

/** Per-page metadata. Repeats openGraph/twitter because Next replaces (not merges) them from the root layout. */
export function pageMetadata({
  title,
  description,
  path,
  keywords = [],
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}): Metadata {
  return {
    title,
    description,
    keywords: [...keywords, ...BASE_KEYWORDS],
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      url: path,
      title,
      description,
      images: [{ url: image, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}
