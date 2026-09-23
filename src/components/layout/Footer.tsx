'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t, isAr } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-xs">
          {/* About */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3">{t('aboutTitle')}</h3>
            <p className="text-slate-500 leading-relaxed">
              {t('aboutText')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-slate-600">
              <li><Link href="/" className="hover:text-[#e03a14]">{t('home')}</Link></li>
              <li><Link href="/sell" className="hover:text-[#e03a14]">{t('sellCar')}</Link></li>
              <li><Link href="/search" className="hover:text-[#e03a14]">{t('searchCars')}</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3">{t('resources')}</h3>
            <ul className="space-y-2 text-slate-600">
              <li><span className="hover:text-[#e03a14] cursor-pointer">{t('helpCenter')}</span></li>
              <li><span className="hover:text-[#e03a14] cursor-pointer">{t('safetyTips')}</span></li>
              <li><span className="hover:text-[#e03a14] cursor-pointer">{t('termsOfUse')}</span></li>
              <li><span className="hover:text-[#e03a14] cursor-pointer">{t('privacyPolicy')}</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-slate-900 mb-3">{t('contact')}</h3>
            <p className="text-slate-500 mb-2">{t('dubaiUae')}</p>
            <p className="text-slate-700 font-semibold" dir="ltr">info@memycar.com</p>
            <p className="text-slate-700 font-semibold mt-1" dir="ltr">+971 50 123 4567</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>© {new Date().getFullYear()} memycar.com. {t('allRightsReserved')}</span>
          <span className="font-semibold text-slate-500">UAE Automotive Marketplace</span>
        </div>
      </div>
    </footer>
  );
}
