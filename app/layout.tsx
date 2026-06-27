import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CERG 2026 Project Finder",
  description:
    "Search and filter all 2026/27 RGC General Research Fund projects by official panel and subject area.",
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
