'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { Lock, Mail, Loader2, AlertCircle, ArrowLeft, User, Phone } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t, isAr } = useLanguage();

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        // Validate UAE Phone Number before creating account
        const cleanPhone = phone.replace(/[\s-]/g, '');
        const uaePhoneRegex = /^(?:\+971|00971|0)?5[024568]\d{7}$/;

        if (!uaePhoneRegex.test(cleanPhone)) {
          setErrorMsg(
            isAr
              ? 'يرجى إدخال رقم هاتف إماراتي متحرك صحيح (مثال: 0501234567 أو +971501234567)'
              : 'Please enter a valid UAE mobile number (e.g., +971 50 123 4567 or 050 123 4567)'
          );
          setLoading(false);
          return;
        }

        let formattedPhone = cleanPhone;
        if (formattedPhone.startsWith('05')) {
          formattedPhone = '+971' + formattedPhone.slice(1);
        } else if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+' + formattedPhone;
        }

        // Register user with metadata locked in from day 1
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: formattedPhone,
            },
          },
        });

        if (error) throw error;

        if (data?.user?.identities?.length === 0) {
          setErrorMsg(isAr ? 'هذا البريد مسجل بالفعل.' : 'Email already registered.');
        } else {
          setSuccessMsg(
            isAr
              ? 'تم إنشاء الحساب بنجاح! جاري تحويلك...'
              : 'Account created successfully! Redirecting...'
          );
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1000);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full shadow-sm">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-slate-900">
            {isSignUp ? t('signup') : t('login')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isSignUp
              ? (isAr
                  ? 'أنشئ حسابك لبدء بيع سياراتك وإدارتها عبر ميميكار'
                  : 'Create an account to start listing and managing vehicles on memycar')
              : (isAr
                  ? 'سجل دخولك لمتابعة إعلاناتك والسيارات المحفوظة'
                  : 'Sign in to manage your cars and view saved listings')}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 mb-4 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl mb-4 text-center font-bold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Sign Up Exclusive Fields: Name & Phone */}
          {isSignUp && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isAr ? 'اسم البائع / المعرض *' : 'Seller / Display Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. DXB01 / Apex Motors"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isAr ? 'رقم الهاتف / الواتساب في الإمارات *' : 'UAE Phone / WhatsApp *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="tel"
                    dir="ltr"
                    placeholder="+971 50 123 4567 or 0501234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {isAr ? 'أرقام الهواتف المعتمدة: 050، 052، 054، 055، 056، 058' : 'Valid UAE carriers: 050, 052, 054, 055, 056, 058'}
                </span>
              </div>
            </>
          )}

          {/* Standard Fields: Email & Password */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#e03a14]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#e03a14]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e03a14] hover:bg-[#c53210] disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignUp ? t('signup') : t('signInWithEmail')}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-500 mt-6">
          {isSignUp ? (
            <p>
              {t('alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="font-bold text-[#e03a14] hover:underline"
              >
                {t('login')}
              </button>
            </p>
          ) : (
            <p>
              {t('dontHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="font-bold text-[#e03a14] hover:underline"
              >
                {t('signup')}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
