import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@fontsource/mukta/devanagari-400.css";
import "@fontsource/mukta/devanagari-500.css";
import "@fontsource/mukta/devanagari-700.css";
import "@fontsource/mukta/devanagari-800.css";
import "@fontsource/mukta/latin-400.css";
import "@fontsource/mukta/latin-500.css";
import "@fontsource/mukta/latin-700.css";
import "@fontsource/mukta/latin-800.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "./globals.css";

import { SITE_URL_FALLBACK, media, site } from "@/lib/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL_FALLBACK;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: site.metaTitle,
  description: site.description,
  applicationName: site.brand,
  authors: [{ name: site.brand, url: site.instagram.url }],
  creator: site.brand,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "hi_IN",
    url: "/",
    siteName: site.brand,
    title: site.metaTitle,
    description: site.description,
    images: [{ url: media.og, ...media.ogSize, alt: site.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.metaTitle,
    description: site.description,
    images: [media.og],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0B0D",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hi">
      <body>
        {children}
        {/* Without JavaScript nothing can fade in, so show everything at once. */}
        <noscript>
          <style>{`[data-reveal],[data-needs-js]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
