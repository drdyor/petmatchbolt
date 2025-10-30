/*
  # Add vet appointments and vaccination tracking

  ## New Tables
  
  1. **vet_clinics**
     - `id` (uuid, primary key)
     - `vet_user_id` (uuid, foreign key to users)
     - `clinic_name` (text)
     - `address` (text)
     - `phone` (text)
     - `email` (text)
     - `created_at` (timestamp)
  
  2. **breeder_vet_relationships**
     - `id` (uuid, primary key)
     - `breeder_id` (uuid, foreign key to users)
     - `vet_user_id` (uuid, foreign key to users)
     - `clinic_id` (uuid, foreign key to vet_clinics)
     - `created_at` (timestamp)
  
  3. **vet_appointments**
     - `id` (uuid, primary key)
     - `pet_id` (uuid, foreign key to pets)
     - `vet_user_id` (uuid, foreign key to users)
     - `breeder_id` (uuid, foreign key to users)
     - `appointment_date` (timestamp)
     - `appointment_type` (text) - checkup, vaccination, surgery, emergency
     - `status` (text) - scheduled, completed, cancelled
     - `notes` (text)
     - `created_at` (timestamp)
  
  4. **vaccinations**
     - `id` (uuid, primary key)
     - `pet_id` (uuid, foreign key to pets)
     - `vet_user_id` (uuid, foreign key to users)
     - `vaccine_name` (text)
     - `date_administered` (timestamp)
     - `next_due_date` (timestamp)
     - `notes` (text)
     - `created_at` (timestamp)

  ## Security
     - Enable RLS on all tables
     - Vets can manage their own appointments and records
     - Breeders can view their pets' records
     - Appropriate policies for each role
*/

-- Vet Clinics Table
CREATE TABLE IF NOT EXISTS vet_clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vet_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  clinic_name text NOT NULL,
  address text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vet_clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vets can manage their clinic"
  ON vet_clinics FOR ALL
  TO authenticated
  USING (vet_user_id = auth.uid())
  WITH CHECK (vet_user_id = auth.uid());

CREATE POLICY "Anyone can view clinics"
  ON vet_clinics FOR SELECT
  TO authenticated
  USING (true);

-- Breeder-Vet Relationships
CREATE TABLE IF NOT EXISTS breeder_vet_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  breeder_id uuid REFERENCES users(id) ON DELETE CASCADE,
  vet_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES vet_clinics(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(breeder_id, vet_user_id)
);

ALTER TABLE breeder_vet_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Breeders can manage their vet relationships"
  ON breeder_vet_relationships FOR ALL
  TO authenticated
  USING (breeder_id = auth.uid())
  WITH CHECK (breeder_id = auth.uid());

CREATE POLICY "Vets can view their breeder relationships"
  ON breeder_vet_relationships FOR SELECT
  TO authenticated
  USING (vet_user_id = auth.uid());

-- Vet Appointments
CREATE TABLE IF NOT EXISTS vet_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  vet_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  breeder_id uuid REFERENCES users(id) ON DELETE CASCADE,
  appointment_date timestamptz NOT NULL,
  appointment_type text CHECK (appointment_type IN ('checkup', 'vaccination', 'surgery', 'emergency', 'other')) DEFAULT 'checkup',
  status text CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vet_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vets can manage their appointments"
  ON vet_appointments FOR ALL
  TO authenticated
  USING (vet_user_id = auth.uid())
  WITH CHECK (vet_user_id = auth.uid());

CREATE POLICY "Breeders can view their appointments"
  ON vet_appointments FOR SELECT
  TO authenticated
  USING (breeder_id = auth.uid());

CREATE POLICY "Breeders can create appointments"
  ON vet_appointments FOR INSERT
  TO authenticated
  WITH CHECK (breeder_id = auth.uid());

-- Vaccinations
CREATE TABLE IF NOT EXISTS vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  vet_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  breeder_id uuid REFERENCES users(id) ON DELETE CASCADE,
  vaccine_name text NOT NULL,
  date_administered timestamptz NOT NULL,
  next_due_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vets can manage vaccinations"
  ON vaccinations FOR ALL
  TO authenticated
  USING (vet_user_id = auth.uid())
  WITH CHECK (vet_user_id = auth.uid());

CREATE POLICY "Breeders can view their pets' vaccinations"
  ON vaccinations FOR SELECT
  TO authenticated
  USING (breeder_id = auth.uid());
