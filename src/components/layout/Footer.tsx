'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { locale } = useLanguage();

  return (
    <footer className="bg-slate-50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">About memycar</h3>
            <p className="text-sm text-slate-600">
              memycar is the UAE's trusted car marketplace, connecting buyers and sellers with verified listings, transparent pricing, and standardized vehicle presentations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/" className="text-sm text-slate-600 hover:text-slate-800">
                Home
              </Link>
              <Link href="/sell" className="text-sm text-slate-600 hover:text-slate-800">
                Sell Your Car
              </Link>
              <Link href="/search" className="text-sm text-slate-600 hover:text-slate-800">
                Search Cars
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Resources</h3>
            <div className="space-y-2">
              <Link href="#" className="text-sm text-slate-600 hover:text-slate-800">
                Help Center
              </Link>
              <Link href="#" className="text-sm text-slate-600 hover:text-slate-800">
                Safety Tips
              </Link>
              <Link href="#" className="text-sm text-slate-600 hover:text-slate-800">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-slate-600 hover:text-slate-800">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Contact</h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                📧 info@memycar.com
              </p>
              <p className="text-sm text-slate-600">
                📞 +971 4 123 4567
              </p>
              <p className="text-sm text-slate-600">
                📍 Dubai, United Arab Emirates
              </p>
            </div>

            <div className="mt-4 flex gap-3">
              <a href="#" className="text-slate-500 hover:text-slate-700 transition">
                🐦 Twitter
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-700 transition">
                📘 Facebook
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-700 transition">
                📸 Instagram
              </a>
              <a href="#" className="text-slate-500 hover:text-slate-700 transition">
                💼 LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Border and Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            © {new Date().getFullYear()} memycar.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}