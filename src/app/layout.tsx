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
  title: "AR Events BD",
  description: "Premium Event Ticketing Platform in Bangladesh by AR NIX",
  keywords: ["event tickets", "concert tickets", "Bangladesh events", "AR Events BD", "AR NIX", "ticket booking", "shows", "entertainment"],
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
    title: "AR Events BD",
    description: "Premium Event Ticketing Platform in Bangladesh by AR NIX",
    url: "https://areventsbd.com",
    siteName: "AR Events BD",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AR Events BD",
    description: "Premium Event Ticketing Platform in Bangladesh by AR NIX",
    creator: "@areventsbd",
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
