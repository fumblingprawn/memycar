'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Lock, 
  Mail, 
  Loader2, 
  AlertCircle, 
  ArrowLeft, 
  User, 
  Phone,
  Check,
  X
} from 'lucide-react';
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

  // Strong Password Checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordStrong = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        // 1. Password Strength Validation
        if (!isPasswordStrong) {
          setErrorMsg(
            isAr
              ? 'كلمة المرور لا تستوفي شروط الأمان المطلوبة.'
              : 'Please ensure your password meets all security requirements.'
          );
          setLoading(false);
          return;
        }

        // 2. UAE Phone Number Format Validation
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

        // 3. Client Pre-Check for Duplicate Username and Phone
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username, phone')
          .or(`username.ilike.${fullName.trim()},phone.eq.${formattedPhone}`)
          .maybeSingle();

        if (existingUser) {
          if (existingUser.username.toLowerCase() === fullName.trim().toLowerCase()) {
            setErrorMsg(
              isAr
                ? 'اسم المستخدم هذا مسجل بالفعل. يرجى اختيار اسم آخر.'
                : 'This username is already taken. Please choose another.'
            );
            setLoading(false);
            return;
          }
          if (existingUser.phone === formattedPhone) {
            setErrorMsg(
              isAr
                ? 'رقم الهاتف هذا مسجل بحساب آخر بالفعل.'
                : 'This phone number is already registered to another account.'
            );
            setLoading(false);
            return;
          }
        }

        // 4. Create Account via Supabase Auth
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
          {isSignUp && (
            <>
              {/* Username */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isAr ? 'اسم المستخدم / المعرض *' : 'Username / Display Name *'}
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

              {/* Phone */}
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

          {/* Email */}
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

          {/* Password */}
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

            {/* Live Strong Password Checklist (Only shown during Sign Up) */}
            {isSignUp && password.length > 0 && (
              <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                <span className="font-bold text-slate-700 block mb-1">
                  {isAr ? 'شروط كلمة المرور:' : 'Password Requirements:'}
                </span>
                
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>{isAr ? '٨ أحرف على الأقل' : 'At least 8 characters'}</span>
                </div>

                <div className={`flex items-center gap-1.5 ${hasUpperCase && hasLowerCase ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {hasUpperCase && hasLowerCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>{isAr ? 'حرف كبير وصغير (A-z)' : 'Uppercase & lowercase letters'}</span>
                </div>

                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>{isAr ? 'رقم واحد على الأقل (0-9)' : 'At least one number'}</span>
                </div>

                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  <span>{isAr ? 'رمز خاص (!@#$%^&*)' : 'At least one symbol (!@#$%^&*)'}</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (isSignUp && !isPasswordStrong)}
            className="w-full bg-[#e03a14] hover:bg-[#c53210] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
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
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg(null);
                }}
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
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg(null);
                }}
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
