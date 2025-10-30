/*
  # Pets and Listings Schema

  ## New Tables

  1. **pets** - Pet profiles
     - `id` (uuid, primary key)
     - `owner_id` (uuid) - References users
     - `name` (text) - Pet name
     - `species` (text) - Dog, Cat, etc.
     - `breed` (text) - Breed
     - `sex` (text) - M or F
     - `date_of_birth` (date) - Birth date
     - `location` (text) - Malta city/region
     - `photos` (text[]) - Array of photo URLs
     - `health_records` (jsonb) - Vaccination records, tests, etc.
     - `status` (text) - available, breeding, retired, etc.
     - `created_at`, `updated_at`

  2. **listings** - Stud listings and adoption posts
     - `id` (uuid, primary key)
     - `owner_id` (uuid) - References users
     - `pet_id` (uuid) - References pets
     - `type` (text) - stud, litter, adoption
     - `title` (text)
     - `description` (text)
     - `price` (integer) - In EUR cents
     - `status` (text) - draft, live, reserved, closed
     - `location` (text)
     - `available_date` (date) - When available
     - `created_at`, `updated_at`

  3. **heat_cycles** - Track breeding cycles
     - `id` (uuid, primary key)
     - `pet_id` (uuid) - References pets
     - `start_date` (date)
     - `cycle_length` (integer) - Days
     - `notes` (text)
     - `created_at`

  ## Security
     - Enable RLS on all tables
     - Owners can manage their own pets and listings
     - Everyone can view live listings
*/

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  species text NOT NULL DEFAULT 'Dog',
  breed text,
  sex text CHECK (sex IN ('M', 'F')) NOT NULL,
  date_of_birth date,
  location text,
  photos text[] DEFAULT '{}',
  health_records jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  type text CHECK (type IN ('stud', 'litter', 'adoption')) NOT NULL,
  title text NOT NULL,
  description text,
  price integer DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'reserved', 'closed')),
  location text,
  available_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create heat_cycles table
CREATE TABLE IF NOT EXISTS heat_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  cycle_length integer DEFAULT 21,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE heat_cycles ENABLE ROW LEVEL SECURITY;

-- Pets policies
CREATE POLICY "Owners can manage own pets"
  ON pets
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Everyone can view pets in live listings"
  ON pets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.pet_id = pets.id
      AND listings.status = 'live'
    )
  );

-- Listings policies
CREATE POLICY "Owners can manage own listings"
  ON listings
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Everyone can view live listings"
  ON listings
  FOR SELECT
  TO authenticated
  USING (status = 'live');

-- Heat cycles policies
CREATE POLICY "Owners can manage heat cycles"
  ON heat_cycles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = heat_cycles.pet_id
      AND pets.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = heat_cycles.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

-- Updated_at triggers
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS pets_owner_id_idx ON pets(owner_id);
CREATE INDEX IF NOT EXISTS pets_species_idx ON pets(species);
CREATE INDEX IF NOT EXISTS listings_owner_id_idx ON listings(owner_id);
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings(status);
CREATE INDEX IF NOT EXISTS listings_type_idx ON listings(type);
CREATE INDEX IF NOT EXISTS heat_cycles_pet_id_idx ON heat_cycles(pet_id);
