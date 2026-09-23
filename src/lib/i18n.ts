import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

export type Locale = 'en' | 'ar';

const dictionaries = { en, ar };

export function t(path: string, locale: Locale): string {
  if (!path) return '';

  const dict = dictionaries[locale] || dictionaries.en;
  const keys = path.split('.');
  
  let current: any = dict;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      current = null;
      break;
    }
  }

  if (typeof current === 'string') return current;

  // Fallback to direct spec/emirate lookup
  if (dict.specs && path in dict.specs) return (dict.specs as any)[path];
  if (dict.emirates && path in dict.emirates) return (dict.emirates as any)[path];

  return path;
}

export function formatPrice(amount: number | string, locale: Locale): string {
  const num = Number(amount) || 0;
  if (locale === 'ar') {
    return `${num.toLocaleString('ar-AE')} درهم`;
  }
  return `AED ${num.toLocaleString('en-US')}`;
}

export function formatMileage(km: number | string, locale: Locale): string {
  const num = Number(km) || 0;
  if (locale === 'ar') {
    return `${num.toLocaleString('ar-AE')} كم`;
  }
  return `${num.toLocaleString('en-US')} km`;
}
