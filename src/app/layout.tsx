import type { Metadata, Viewport } from "next";
import { DM_Sans, Noto_Sans_Devanagari, Playfair_Display } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["500", "600"],
  variable: "--font-devanagari",
  display: "swap",
});

const pageTitle = `${siteConfig.name} | Tiles, Marble & Natural Stone in Etawah`;

export const metadata: Metadata = {
  title: {
    default: pageTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: "home improvement",
  keywords: [
    "FK Marble",
    "tiles Etawah",
    "marble Etawah",
    "granite Etawah",
    "Kota stone",
    "sandstone",
    "natural stone Uttar Pradesh",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: siteConfig.logo.favicon, type: "image/svg+xml" }],
  },
  openGraph: {
    title: pageTitle,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: pageTitle,
    description: siteConfig.description,
  },
  other: {
    "geo.region": "IN-UP",
    "geo.placename": "Etawah",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#24231F" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={siteConfig.locale}
      className={`${dmSans.variable} ${playfair.variable} ${devanagari.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
