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
  title: "memycar",
  description: "UAE's trusted car marketplace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <html
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="overflow-x-hidden" className="min-h-full flex flex-col">
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