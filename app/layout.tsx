import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CERG 2026 HSS Project Finder",
  description:
    "Search and filter 2026/27 RGC General Research Fund projects in Humanities and Social Sciences.",
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
