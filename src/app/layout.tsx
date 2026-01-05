import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AR Events BD | Premium Concert Ticketing Bangladesh",
  description: "Buy concert tickets for Artcell, Warfaze, and top Bangladeshi bands. QR-based digital tickets with instant verification. Premium event ticketing platform by AR NIX.",
  keywords: ["concert tickets", "artcell", "warfaze", "bangladesh events", "qr tickets", "ar nix", "ar events bd", "premium concerts", "bangla music", "rock concerts", "digital tickets", "event booking", "dhaka events", "live shows", "entertainment", "music festivals"],
  authors: [{ name: "AR Turjo" }],
  creator: "AR Turjo",
  publisher: "AR NIX",
  metadataBase: new URL("https://areventsbd.com"),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "AR Events BD | Premium Concert Ticketing Bangladesh",
    description: "Buy concert tickets for Artcell, Warfaze, and top Bangladeshi bands. QR-based digital tickets with instant verification.",
    url: "https://areventsbd.com",
    siteName: "AR Events BD",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AR Events BD - Premium Concert Ticketing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AR Events BD | Premium Concert Ticketing Bangladesh",
    description: "Buy concert tickets for Artcell, Warfaze, and top Bangladeshi bands. QR-based digital tickets with instant verification.",
    creator: "@areventsbd",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://areventsbd.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
