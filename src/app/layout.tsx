import type { Metadata } from "next";
import { Toaster } from "sonner";

import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BHUMI — Design & Construction",
    template: "%s | BHUMI",
  },
  description:
    "Civil engineering and construction solutions in Tulsipur, Dang, Nepal.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_NP",
    siteName: "BHUMI",
    title: "BHUMI — Design & Construction",
    description:
      "Civil engineering and construction solutions in Tulsipur, Dang, Nepal.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BHUMI — Design & Construction",
    description:
      "Civil engineering and construction solutions in Tulsipur, Dang, Nepal.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
