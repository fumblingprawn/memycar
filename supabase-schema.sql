-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums for the listing table
CREATE TYPE vehicle_spec AS ENUM ('GCC', 'American', 'Japanese', 'European');
CREATE TYPE emirate AS ENUM ('Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain');
CREATE TYPE service_history AS ENUM ('Full Agency', 'Regular/Specialist', 'Partial/None');
CREATE TYPE paint_condition AS ENUM ('Original Paint', 'Minor Touch-ups', 'Repainted');
CREATE TYPE warranty_status AS ENUM ('Under Agency Warranty', 'Dealer/Third-Party', 'Expired/None');

-- Create the listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  price_aed INTEGER NOT NULL CHECK (price_aed >= 0),
  mileage_km INTEGER NOT NULL CHECK (mileage_km >= 0),
  specs vehicle_spec NOT NULL,
  emirate emirate NOT NULL,
  body_style VARCHAR(100) NOT NULL,
  service_history service_history NOT NULL,
  paint_condition paint_condition NOT NULL,
  warranty warranty_status NOT NULL,
  keys_count INTEGER NOT NULL CHECK (keys_count IN (1, 2)),
  seller_name VARCHAR(255) NOT NULL,
  seller_phone VARCHAR(20) NOT NULL,
  seller_whatsapp VARCHAR(20),
  description TEXT NOT NULL CHECK (CHAR_LENGTH(description) <= 400),
  photos JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create policies for listings table
-- Policy: Allow public read access to listings
CREATE POLICY "Allow public read access to listings"
  ON public.listings
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated users to insert listings
CREATE POLICY "Allow authenticated users to insert listings"
  ON public.listings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow users to update their own listings
CREATE POLICY "Allow users to update own listings"
  ON public.listings
  FOR UPDATE
  USING (auth.uid()::text = id::text); -- Assuming we might link to user ID later

-- Policy: Allow users to delete their own listings
CREATE POLICY "Allow users to delete own listings"
  ON public.listings
  FOR DELETE
  USING (auth.uid()::text = id::text);

-- Create storage bucket for car media
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-media', 'car-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for car-media bucket
-- Allow public read access to car-media objects
CREATE POLICY "Allow public read access to car-media objects"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'car-media');

-- Allow authenticated users to upload to car-media bucket
CREATE POLICY "Allow authenticated users to upload to car-media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'car-media');

-- Allow authenticated users to update their own objects in car-media
CREATE POLICY "Allow authenticated users to update own car-media objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'car-media')
  WITH CHECK (bucket_id = 'car-media');

-- Allow authenticated users to delete their own objects from car-media
CREATE POLICY "Allow authenticated users to delete own car-media objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'car-media');

-- Create updated_at trigger for listings table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE
ON public.listings FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();