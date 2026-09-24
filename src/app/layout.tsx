import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Suspense } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "memycar | Verified Pre-Owned & Luxury Cars in UAE",
    template: "%s | memycar.com"
  },
  description: "Explore verified pre-owned, luxury and GCC spec cars for sale in Dubai, Abu Dhabi and across the UAE. Direct owner messaging, dealer inventories, and zero hidden fees.",
  keywords: ["used cars dubai", "cars for sale uae", "gcc specs cars", "luxury cars dubai", "memycar", "buy car dubai"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "memycar | Verified Pre-Owned Cars in UAE",
    description: "Browse handpicked, verified GCC & pre-owned cars for sale in Dubai and UAE with direct seller messaging.",
    url: "https://memycar.com",
    siteName: "memycar.com",
    locale: "en_AE",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <html
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="overflow-x-hidden min-h-full flex flex-col">
          <Header />
          <main className="flex-grow">
            <Suspense fallback={<div>Loading...</div>}>
              {children}
            </Suspense>
          </main>
          <Footer />
        </body>
      </html>
    </LanguageProvider>
  );
}