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
  inspectNotice: { en: 'Inspect chassis and registration (Mulkiya) in person before payment.', ar: 'يرجى فحص الشاسيه والملكية شخصياً قبل الدفع.' },
  backToSearch: { en: 'Back to search', ar: 'العودة للبحث' },
  listingNotFound: { en: 'Listing Not Found', ar: 'الإعلان غير موجود' },
  listingRemovedMsg: { en: 'This vehicle may have been sold or removed.', ar: 'قد تكون هذه السيارة قد بيعت أو تم حذفها.' },
  inspectZoom: { en: 'Inspect & Zoom', ar: 'تكبير وفحص' },
  directSeller: { en: 'Direct UAE Seller', ar: 'بائع مباشر في الإمارات' },
  phoneNotAvailable: { en: 'Phone Not Available', ar: 'رقم الهاتف غير متاح' },
  linkCopied: { en: 'Link Copied!', ar: 'تم نسخ الرابط!' },
  keyDetails: { en: 'Key Vehicle Details', ar: 'المواصفات الرئيسية للسيارة' },
  serviceRecords: { en: 'Service & Maintenance Records', ar: 'سجل الصيانة والخدمة' },
  vehicleDescription: { en: 'Vehicle Description', ar: 'وصف السيارة' },
  lastServiced: { en: 'Last Serviced', ar: 'آخر صيانة' },
  noServiceDate: { en: 'No specific service date recorded.', ar: 'لا يوجد تاريخ صيانة محدد مسجل.' },
  maintenanceNotes: { en: 'Maintenance Notes', ar: 'ملاحظات الصيانة' },
  verifiedDocs: { en: 'Verified Documents', ar: 'مستندات موثقة' },

  // Form & Spec Labels
  make: { en: 'Make', ar: 'الماركة' },
  allMakes: { en: 'All Makes', ar: 'جميع الماركات' },
  model: { en: 'Model', ar: 'الموديل' },
  allModels: { en: 'All Models', ar: 'جميع الموديلات' },
  year: { en: 'Year', ar: 'سنة الصنع' },
  mileage: { en: 'Mileage', ar: 'المسافة المقطوعة' },
  price: { en: 'Price', ar: 'السعر' },
  emirate: { en: 'Emirate / City', ar: 'الإمارة / المدينة' },
  allEmirates: { en: 'All Emirates', ar: 'جميع الإمارات' },
  specs: { en: 'Regional Specs', ar: 'المواصفات الإقليمية' },
  allSpecs: { en: 'All Specs', ar: 'جميع المواصفات' },
  transmission: { en: 'Transmission', ar: 'ناقل الحركة' },
  fuelType: { en: 'Fuel Type', ar: 'نوع الوقود' },
  previousOwners: { en: 'Previous Owners', ar: 'عدد الملاك السابقين' },
  serviceHistory: { en: 'Service History', ar: 'سجل الصيانة' },
  accidentHistory: { en: 'Accident History', ar: 'سجل الحوادث' },
  warranty: { en: 'Warranty', ar: 'الضمان' },
  bodyType: { en: 'Body Type', ar: 'نوع الهيكل' },
  horsepower: { en: 'Horsepower', ar: 'القوة الحصانية' },
  cylinders: { en: 'Cylinders', ar: 'عدد الأسطوانات' },
  exteriorColor: { en: 'Exterior Color', ar: 'اللون الخارجي' },

  // Select Placeholders
  selectMake: { en: 'Select Make', ar: 'اختر الماركة' },
  selectModel: { en: 'Select Model', ar: 'اختر الموديل' },
  selectYear: { en: 'Select Year', ar: 'اختر سنة الصنع' },
  selectSpecs: { en: 'Select Regional Specs', ar: 'اختر المواصفات' },
  selectEmirate: { en: 'Select Emirate', ar: 'اختر الإمارة' },
  selectTransmission: { en: 'Select Transmission', ar: 'اختر ناقل الحركة' },
  selectFuelType: { en: 'Select Fuel Type', ar: 'اختر نوع الوقود' },
  selectOwners: { en: 'Select Previous Owners', ar: 'اختر عدد الملاك' },
  selectAccident: { en: 'Select Accident Condition', ar: 'اختر حالة الحوادث' },
  selectWarranty: { en: 'Select Warranty Status', ar: 'اختر حالة الضمان' },
  selectBodyType: { en: 'Select Body Type', ar: 'اختر نوع الهيكل' },
  selectHorsepower: { en: 'Select Horsepower', ar: 'اختر القوة الحصانية' },
  selectCylinders: { en: 'Select Cylinders', ar: 'اختر عدد الأسطوانات' },

  // Field Values
  'GCC Specs': { en: 'GCC Specs', ar: 'مواصفات خليجية' },
  'Non-GCC / American': { en: 'American Specs', ar: 'مواصفات أمريكية' },
  'Non-GCC / Japanese': { en: 'Japanese Specs', ar: 'مواصفات يابانية' },
  'Non-GCC / European': { en: 'European Specs', ar: 'مواصفات أوروبية' },
  'Automatic': { en: 'Automatic', ar: 'أوتوماتيك' },
  'Manual': { en: 'Manual', ar: 'عادي' },
  'Petrol': { en: 'Petrol', ar: 'بنزين' },
  'Diesel': { en: 'Diesel', ar: 'ديزل' },
  'Hybrid': { en: 'Hybrid', ar: 'هايبرد' },
  'Electric': { en: 'Electric', ar: 'كهربائي' },
  'Documented': { en: 'Documented Agency', ar: 'صيانة وكالة موثقة' },
  'Standard': { en: 'Regular Service', ar: 'صيانة دورية' },

  // Dubizzle Standards Values
  'Clean (No Accidents)': { en: 'Clean (No Accidents)', ar: 'سليم (بدون حوادث)' },
  'Minor Cosmetic Paint': { en: 'Minor Cosmetic Repaint', ar: 'رش تجميلي بسيط' },
  'Accident Repaired': { en: 'Accident Repaired', ar: 'تم إصلاح حادث سابق' },
  'Under Agency Warranty': { en: 'Under Agency Warranty', ar: 'تحت ضمان الوكالة' },
  'No Warranty / Expired': { en: 'Warranty Expired', ar: 'الضمان منتهي / بدون ضمان' },
  'Sedan': { en: 'Sedan', ar: 'سيدان' },
  'SUV': { en: 'SUV / Crossover', ar: 'دفع رباعي / عائلية' },
  'Coupe': { en: 'Coupe', ar: 'كوبيه' },
  'Convertible': { en: 'Convertible', ar: 'كشف' },
  'Hatchback': { en: 'Hatchback', ar: 'هاتشباك' },
  'Truck': { en: 'Pickup / Truck', ar: 'بيك أب / شاحنة' },
  'Under 200 HP': { en: 'Under 200 HP', ar: 'أقل من 200 حصان' },
  '200 - 300 HP': { en: '200 - 300 HP', ar: '200 - 300 حصان' },
  '300 - 400 HP': { en: '300 - 400 HP', ar: '300 - 400 حصان' },
  '400 - 500 HP': { en: '400 - 500 HP', ar: '400 - 500 حصان' },
  '500+ HP': { en: '500+ HP', ar: 'أكثر من 500 حصان' },
  '4 Cylinder': { en: '4 Cylinder', ar: '4 أسطوانات' },
  '6 Cylinder': { en: '6 Cylinder', ar: '6 أسطوانات' },
  '8 Cylinder': { en: '8 Cylinder', ar: '8 أسطوانات' },
  '10+ Cylinder': { en: '10+ Cylinder', ar: '10+ أسطوانات' },

  // Emirates
  'Dubai': { en: 'Dubai', ar: 'دبي' },
  'Abu Dhabi': { en: 'Abu Dhabi', ar: 'أبوظبي' },
  'Sharjah': { en: 'Sharjah', ar: 'الشارقة' },
  'Ajman': { en: 'Ajman', ar: 'عجمان' },
  'Ras Al Khaimah': { en: 'Ras Al Khaimah', ar: 'رأس الخيمة' },
  'Fujairah': { en: 'Fujairah', ar: 'الفجيرة' },
  'Umm Al Quwain': { en: 'Umm Al Quwain', ar: 'أم القيوين' },

  // Top Makes
  'Toyota': { en: 'Toyota', ar: 'تويوتا' },
  'Nissan': { en: 'Nissan', ar: 'نيسان' },
  'Mercedes-Benz': { en: 'Mercedes-Benz', ar: 'مرسيدس بنز' },
  'Porsche': { en: 'Porsche', ar: 'بورشه' },
  'BMW': { en: 'BMW', ar: 'بي إم دبليو' },
  'Land Rover': { en: 'Land Rover', ar: 'لاند روفر' },
  'Lexus': { en: 'Lexus', ar: 'لكزس' },
  'Ford': { en: 'Ford', ar: 'فورد' },
  'Audi': { en: 'Audi', ar: 'أودي' },
} as const;

export function t(key: string | undefined | null, locale: Locale): string {
  if (!key) return '';
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
