import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2026/27 RGC GRF Project Finder | 1493 Hong Kong Research Grants",
  description:
    "Search all 1493 projects awarded under Hong Kong RGC General Research Fund 2026/27 by official panel, subject area, institution, PI, keywords, and approved funding.",
  keywords: [
    "RGC",
    "Research Grants Council",
    "General Research Fund",
    "GRF",
    "CERG",
    "Hong Kong research grants",
    "2026/27",
  ],
  alternates: {
    canonical: "https://mamingsuper.github.io/cerg-2026-hss-projects/",
  },
  openGraph: {
    type: "website",
    siteName: "CERG 2026 Project Finder",
    title: "2026/27 RGC GRF Project Finder",
    description:
      "Search and download 1493 Hong Kong RGC General Research Fund projects awarded in 2026/27.",
    url: "https://mamingsuper.github.io/cerg-2026-hss-projects/",
  },
  twitter: {
    card: "summary",
    title: "2026/27 RGC GRF Project Finder",
    description:
      "Search all 1493 RGC GRF projects by panel, subject area, institution, PI, keywords, and funding.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
