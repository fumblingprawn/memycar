export type Locale = 'en' | 'ar';

export const DICTIONARY: Record<string, { en: string; ar: string }> = {
  // Navigation & Buttons
  'search': { en: 'Search', ar: 'بحث' },
  'sellCar': { en: '+ Sell Your Car', ar: '+ بيع سيارتك' },
  'searchCars': { en: 'Search Cars', ar: 'ابحث عن سيارات' },
  'reset': { en: 'Reset', ar: 'إعادة تعيين' },
  'call': { en: 'Call', ar: 'اتصال' },
  'save': { en: 'Save', ar: 'حفظ' },
  'saved': { en: 'Saved', ar: 'تم الحفظ' },
  'share': { en: 'Share', ar: 'مشاركة' },
  'linkCopied': { en: 'Link Copied!', ar: 'تم نسخ الرابط!' },
  'greatPrice': { en: 'Great Market Price', ar: 'سعر مميز في السوق' },
  'verifiedListing': { en: 'Verified UAE Listing', ar: 'إعلان موثق في الإمارات' },
  'inspectNotice': { en: 'Inspect chassis and registration (Mulkiya) in person before payment.', ar: 'يرجى فحص الشاسيه والملكية شخصياً قبل الدفع.' },
  'backToSearch': { en: 'Back to search', ar: 'العودة للبحث' },
  'directSeller': { en: 'Direct UAE Seller', ar: 'بائع مباشر في الإمارات' },
  'phoneNotAvailable': { en: 'Phone Not Available', ar: 'رقم الهاتف غير متاح' },
  'listingNotFound': { en: 'Listing Not Found', ar: 'الإعلان غير موجود' },
  'listingRemovedMsg': { en: 'This vehicle may have been sold or removed.', ar: 'قد تكون هذه السيارة قد بيعت أو تم حذفها.' },
  'inspectZoom': { en: 'Inspect & Zoom', ar: 'تكبير وفحص' },

  // Form Step Headers
  'step1': { en: 'Step 1: Vehicle Information', ar: 'الخطوة ١: معلومات ومواصفات السيارة' },
  'step2': { en: 'Step 2: Vehicle Photos', ar: 'الخطوة ٢: صور السيارة' },
  'step3': { en: 'Step 3: Service History & Invoices', ar: 'الخطوة ٣: سجل الصيانة والمستندات' },
  'step4': { en: 'Step 4: Seller Details', ar: 'الخطوة ٤: معلومات البائع' },

  // Field Labels
  'make': { en: 'Make', ar: 'الماركة' },
  'model': { en: 'Model', ar: 'الموديل' },
  'year': { en: 'Year', ar: 'سنة الصنع' },
  'yearFrom': { en: 'Year from', ar: 'من سنة' },
  'yearTo': { en: 'Year to', ar: 'إلى سنة' },
  'trim': { en: 'Trim / Edition', ar: 'الفئة / الإصدار' },
  'transmission': { en: 'Transmission', ar: 'ناقل الحركة' },
  'specs': { en: 'Regional Specs', ar: 'المواصفات الإقليمية' },
  'mileage': { en: 'Mileage', ar: 'المسافة المقطوعة' },
  'mileageKm': { en: 'Mileage (KM)', ar: 'المسافة المقطوعة (كم)' },
  'price': { en: 'Price', ar: 'السعر' },
  'priceAed': { en: 'Price (AED)', ar: 'السعر (درهم)' },
  'emirate': { en: 'Emirate / City', ar: 'الإمارة / المدينة' },
  'accidentHistory': { en: 'Accident History', ar: 'سجل الحوادث' },
  'warranty': { en: 'Warranty', ar: 'الضمان' },
  'horsepower': { en: 'Horse Power (HP)', ar: 'القوة الحصانية (HP)' },
  'cylinders': { en: 'Cylinders', ar: 'عدد الأسطوانات' },
  'bodyType': { en: 'Body Type', ar: 'نوع الهيكل' },
  'previousOwners': { en: 'Previous Owners', ar: 'عدد الملاك السابقين' },
  'exteriorColor': { en: 'Exterior Color', ar: 'اللون الخارجي' },
  'vehicleDescription': { en: 'Vehicle Description', ar: 'وصف السيارة' },
  'fuelType': { en: 'Fuel Type', ar: 'نوع الوقود' },
  'serviceHistory': { en: 'Service History', ar: 'سجل الصيانة' },
  'keyDetails': { en: 'Key Vehicle Details', ar: 'المواصفات الرئيسية للسيارة' },
  'serviceRecords': { en: 'Service & Maintenance Records', ar: 'سجل الصيانة والخدمة' },
  'lastServiced': { en: 'Last Serviced', ar: 'آخر صيانة' },
  'noServiceDate': { en: 'No specific service date recorded.', ar: 'لا يوجد تاريخ صيانة مسجل.' },
  'maintenanceNotes': { en: 'Maintenance Notes', ar: 'ملاحظات الصيانة' },

  // Select Placeholders
  'allMakes': { en: 'All Makes', ar: 'جميع الماركات' },
  'allModels': { en: 'All Models', ar: 'جميع الموديلات' },
  'allEmirates': { en: 'All Emirates', ar: 'جميع الإمارات' },
  'allSpecs': { en: 'All Specs', ar: 'جميع المواصفات' },
  'selectMake': { en: 'Select Make', ar: 'اختر الماركة' },
  'selectModel': { en: 'Select Model', ar: 'اختر الموديل' },
  'selectMakeFirst': { en: 'Select Make First', ar: 'اختر الماركة أولاً' },
  'selectYear': { en: 'Select Year', ar: 'اختر سنة الصنع' },
  'selectTransmission': { en: 'Select Transmission', ar: 'اختر ناقل الحركة' },
  'selectSpecs': { en: 'Select Regional Specs', ar: 'اختر المواصفات' },
  'selectEmirate': { en: 'Select Emirate', ar: 'اختر الإمارة' },
  'selectAccident': { en: 'Select Accident Condition', ar: 'اختر حالة الحوادث' },
  'selectWarranty': { en: 'Select Warranty Status', ar: 'اختر حالة الضمان' },
  'selectHorsepower': { en: 'Select Horsepower', ar: 'اختر القوة الحصانية' },
  'selectCylinders': { en: 'Select Cylinders', ar: 'اختر عدد الأسطوانات' },
  'selectBodyType': { en: 'Select Body Type', ar: 'اختر نوع الهيكل' },
  'selectOwners': { en: 'Select Previous Owners', ar: 'اختر عدد الملاك' },

  // Specification Values
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

  // Dubizzle Market Values
  'Clean (No Accidents)': { en: 'Clean (No Accidents)', ar: 'سليم (بدون حوادث)' },
  'Minor Cosmetic Paint': { en: 'Minor Cosmetic Paint', ar: 'رش تجميلي بسيط' },
  'Accident Repaired': { en: 'Accident Repaired', ar: 'تم إصلاح حادث سابق' },
  'Under Agency Warranty': { en: 'Under Agency Warranty', ar: 'تحت ضمان الوكالة' },
  'No Warranty / Expired': { en: 'Warranty Expired', ar: 'بدون ضمان / منتهي' },
  'Sedan': { en: 'Sedan', ar: 'سيدان' },
  'SUV': { en: 'SUV / Crossover', ar: 'دفع رباعي / عائلية' },
  'Coupe': { en: 'Coupe', ar: 'كوبيه' },
  'Convertible': { en: 'Convertible', ar: 'كشف' },
  'Hatchback': { en: 'Hatchback', ar: 'هاتشباك' },
  'Truck': { en: 'Pickup / Truck', ar: 'بيك أب / شاحنة' },
  '3 Cylinder': { en: '3 Cylinder', ar: '٣ أسطوانات' },
  '4 Cylinder': { en: '4 Cylinder', ar: '٤ أسطوانات' },
  '6 Cylinder': { en: '6 Cylinder', ar: '٦ أسطوانات' },
  '8 Cylinder': { en: '8 Cylinder', ar: '٨ أسطوانات' },
  '10 Cylinder': { en: '10 Cylinder', ar: '١٠ أسطوانات' },
  '12 Cylinder': { en: '12 Cylinder', ar: '١٢ أسطوانة' },
  'Electric / None': { en: 'Electric / None', ar: 'كهربائي / بدون' },

  // Emirates
  'Dubai': { en: 'Dubai', ar: 'دبي' },
  'Abu Dhabi': { en: 'Abu Dhabi', ar: 'أبوظبي' },
  'Sharjah': { en: 'Sharjah', ar: 'الشارقة' },
  'Ajman': { en: 'Ajman', ar: 'عجمان' },
  'Ras Al Khaimah': { en: 'Ras Al Khaimah', ar: 'رأس الخيمة' },
  'Fujairah': { en: 'Fujairah', ar: 'الفجيرة' },
  'Umm Al Quwain': { en: 'Umm Al Quwain', ar: 'أم القيوين' },
  'Other': { en: 'Other', ar: 'أخرى' },
};

export function t(key: string | undefined | null, locale: Locale = 'en'): string {
  if (!key) return '';
  const cleanKey = key.trim();
  if (DICTIONARY[cleanKey]) {
    return DICTIONARY[cleanKey][locale] || cleanKey;
  }
  return cleanKey;
}

export function formatPrice(amount: number | string, locale: Locale = 'en'): string {
  const num = Number(amount) || 0;
  if (locale === 'ar') {
    return `${num.toLocaleString('ar-AE')} درهم`;
  }
  return `AED ${num.toLocaleString('en-US')}`;
}

export function formatMileage(km: number | string, locale: Locale = 'en'): string {
  const num = Number(km) || 0;
  if (locale === 'ar') {
    return `${num.toLocaleString('ar-AE')} كم`;
  }
  return `${num.toLocaleString('en-US')} km`;
}
