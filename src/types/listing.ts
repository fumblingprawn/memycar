export type VehicleSpec = 'GCC' | 'American' | 'Japanese' | 'European';

export type Emirate =
  | 'Dubai'
  | 'Abu Dhabi'
  | 'Sharjah'
  | 'Ajman'
  | 'Ras Al Khaimah'
  | 'Fujairah'
  | 'Umm Al Quwain';

export type ServiceHistory = 'Full Agency' | 'Regular/Specialist' | 'Partial/None';
export type PaintCondition = 'Original Paint' | 'Minor Touch-ups' | 'Repainted';
export type WarrantyStatus = 'Under Agency Warranty' | 'Dealer/Third-Party' | 'Expired/None';

export type PhotoSlotKey =
  | 'front_three_quarter'
  | 'rear_three_quarter'
  | 'side_profile'
  | 'interior_dash'
  | 'odometer';

export interface ListingPhotos {
  front_three_quarter?: string;
  rear_three_quarter?: string;
  side_profile?: string;
  interior_dash?: string;
  odometer?: string;
  extra_photos?: string[];
}

export interface Listing {
  id: string;
  user_id?: string;
  title: string;
  make: string;
  model: string;
  trim?: string;
  year: number;
  price_aed: number;
  price?: number; // Alternative price field
  mileage_km: number;
  mileage?: number; // Alternative mileage field
  specs: VehicleSpec;
  emirate: Emirate;
  body_style?: string;
  service_history: ServiceHistory;
  paint_condition: PaintCondition;
  warranty: WarrantyStatus;
  keys_count: 1 | 2;
  seller_name: string;
  seller_phone: string;
  seller_whatsapp: string;
  whatsapp_number?: string; // Alternative whatsapp field
  description?: string;
  description_ar?: string; // Arabic description
  description_en?: string; // English description
  service_notes?: string;
  service_notes_ar?: string; // Arabic service notes
  service_notes_en?: string; // English service notes
  transmission?: string; // e.g., 'Automatic', 'Manual'
  fuel_type?: string; // e.g., 'Petrol', 'Diesel', 'Electric', 'Hybrid'
  photos: ListingPhotos;
  is_featured?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
  // New fields for service history
  last_service_date?: string; // ISO date string
  service_record_urls?: string[]; // URLs to files in service-records bucket
}
