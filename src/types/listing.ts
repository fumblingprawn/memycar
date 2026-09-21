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
  mileage_km: number;
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
  description?: string;
  photos: ListingPhotos;
  is_featured?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}
