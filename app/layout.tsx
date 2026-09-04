import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://outerline.nyc'),
  title: {
    default: "OUTERLINE — Defined & Unconfined",
    template: "%s | OUTERLINE",
  },
  description:
    "High-end NYC streetwear merging drop culture with editorial luxury. Brooklyn-born, globally defined.",
  keywords: [
    "Outerline",
    "NYC streetwear",
    "Brooklyn",
    "luxury streetwear",
    "drops",
    "hoodies",
    "tees",
    "editorial fashion",
  ],
  authors: [{ name: "Outerline NYC" }],
  creator: "Outerline NYC",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://outerline.nyc",
    siteName: "OUTERLINE",
    title: "OUTERLINE — Defined & Unconfined",
    description:
      "High-end NYC streetwear merging drop culture with editorial luxury.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OUTERLINE — Defined & Unconfined",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OUTERLINE — Defined & Unconfined",
    description:
      "High-end NYC streetwear merging drop culture with editorial luxury.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=IBM+Plex+Sans+Condensed:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;0,900;1,600;1,700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#F3F3F3",
              border: "1px solid #E5E5E5",
              color: "#0A192F",
            },
          }}
        />
      </body>
    </html>
  );
}
