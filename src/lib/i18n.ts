export type Locale = 'en' | 'ar';

export const DICTIONARY = {
  // Navigation & Actions
  search: { en: 'Search', ar: 'بحث' },
  sellCar: { en: '+ Sell Your Car', ar: '+ بيع سيارتك' },
  searchCars: { en: 'Search Cars', ar: 'ابحث عن سيارات' },
  reset: { en: 'Reset', ar: 'إعادة تعيين' },
  call: { en: 'Call', ar: 'اتصال' },
  save: { en: 'Save', ar: 'حفظ' },
  saved: { en: 'Saved', ar: 'تم الحفظ' },
  share: { en: 'Share', ar: 'مشاركة' },
  greatPrice: { en: 'Great Market Price', ar: 'سعر مميز في السوق' },
  verifiedListing: { en: 'Verified UAE Listing', ar: 'إعلان موثق في الإمارات' },
  inspectNotice: { en: 'Inspect chassis and registration (Mulkiya) before payment.', ar: 'يرجى فحص الشاسيه والملكية شخصياً قبل الدفع.' },

  // Filter & Form Fields
  make: { en: 'Make', ar: 'الماركة' },
  allMakes: { en: 'All Makes', ar: 'جميع الماركات' },
  model: { en: 'Model', ar: 'الموديل' },
  allModels: { en: 'All Models', ar: 'جميع الموديلات' },
  year: { en: 'Year', ar: 'سنة الصنع' },
  yearFrom: { en: 'Year from', ar: 'من سنة' },
  yearTo: { en: 'Year to', ar: 'إلى سنة' },
  mileage: { en: 'Mileage (km)', ar: 'المسافة (كم)' },
  mileageFrom: { en: 'Mileage from', ar: 'المسافة من' },
  mileageTo: { en: 'Mileage to', ar: 'المسافة إلى' },
  price: { en: 'Price (AED)', ar: 'السعر (درهم)' },
  priceFrom: { en: 'Price from', ar: 'السعر من' },
  priceTo: { en: 'Price to', ar: 'السعر إلى' },
  emirate: { en: 'Emirate', ar: 'الإمارة' },
  allEmirates: { en: 'All Emirates', ar: 'جميع الإمارات' },
  specs: { en: 'Regional Specs', ar: 'المواصفات' },
  allSpecs: { en: 'All Specs', ar: 'جميع المواصفات' },
  transmission: { en: 'Transmission', ar: 'ناقل الحركة' },
  fuelType: { en: 'Fuel Type', ar: 'نوع الوقود' },
  serviceHistory: { en: 'Service History', ar: 'سجل الصيانة' },

  // Specs Values
  'GCC Specs': { en: 'GCC Specs', ar: 'مواصفات خليجية' },
  'American Specs': { en: 'American Specs', ar: 'مواصفات أمريكية' },
  'Japanese Specs': { en: 'Japanese Specs', ar: 'مواصفات يابانية' },
  'European Specs': { en: 'European Specs', ar: 'مواصفات أوروبية' },
  'Automatic': { en: 'Automatic', ar: 'أوتوماتيك' },
  'Manual': { en: 'Manual', ar: 'عادي' },
  'Petrol': { en: 'Petrol', ar: 'بنزين' },
  'Diesel': { en: 'Diesel', ar: 'ديزل' },
  'Hybrid': { en: 'Hybrid', ar: 'هايبرد' },
  'Electric': { en: 'Electric', ar: 'كهرباء' },
  'Documented': { en: 'Documented Agency', ar: 'صيانة وكالة موثقة' },
  'Standard': { en: 'Regular Service', ar: 'صيانة دورية' },

  // Emirates
  'Dubai': { en: 'Dubai', ar: 'دبي' },
  'Abu Dhabi': { en: 'Abu Dhabi', ar: 'أبوظبي' },
  'Sharjah': { en: 'Sharjah', ar: 'الشارقة' },
  'Ajman': { en: 'Ajman', ar: 'عجمان' },
  'Ras Al Khaimah': { en: 'Ras Al Khaimah', ar: 'رأس الخيمة' },
  'Fujairah': { en: 'Fujairah', ar: 'الفجيرة' },
  'Umm Al Quwain': { en: 'Umm Al Quwain', ar: 'أم القيوين' },

  // Top Car Makes (English -> Arabic Names)
  'Toyota': { en: 'Toyota', ar: 'تويوتا' },
  'Nissan': { en: 'Nissan', ar: 'نيسان' },
  'Mercedes-Benz': { en: 'Mercedes-Benz', ar: 'مرسيدس بنز' },
  'BMW': { en: 'BMW', ar: 'بي إم دبليو' },
  'Porsche': { en: 'Porsche', ar: 'بورشه' },
  'Land Rover': { en: 'Land Rover', ar: 'لاند روفر' },
  'Lexus': { en: 'Lexus', ar: 'لكزس' },
  'Ford': { en: 'Ford', ar: 'فورد' },
  'Audi': { en: 'Audi', ar: 'أودي' },
  'Volkswagen': { en: 'Volkswagen', ar: 'فولكس واجن' },
  'Hyundai': { en: 'Hyundai', ar: 'هيونداي' },
  'Kia': { en: 'Kia', ar: 'كيا' },
  'Chevrolet': { en: 'Chevrolet', ar: 'شيفروليه' },
  'Jeep': { en: 'Jeep', ar: 'جيب' },
  'Mitsubishi': { en: 'Mitsubishi', ar: 'ميتسوبيشي' },
} as const;

export type TranslationKey = keyof typeof DICTIONARY;

export function t(key: string, locale: Locale): string {
  if (key in DICTIONARY) {
    return (DICTIONARY as any)[key][locale] || key;
  }
  return key;
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
