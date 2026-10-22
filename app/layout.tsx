import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { DialogProvider } from "@/components/admin/ConfirmDialog";
import { ToastProvider } from "@/components/ui/Toast";
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const home = pageMetadata({
  title: "Accurate Liquid — Liquid Detergent & Home Cleaning Products",
  description:
    "Shop Accurate Liquid detergent, dishwash, floor and toilet cleaners. Certified-quality home care, proudly made in Surat and delivered across India.",
  path: "/",
});

export const metadata: Metadata = {
  ...home,
  metadataBase: new URL(SITE_URL),
  title: { default: home.title as string, template: `%s | ${SITE_NAME}` },
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased">
        <AuthProvider>
          <DialogProvider>
            <ToastProvider>{children}</ToastProvider>
          </DialogProvider>
        </AuthProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
