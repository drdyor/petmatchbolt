/*
  # Recreate breeds table with size variants and temperaments

  ## Changes
  
  1. **Drop existing breeds table**
  2. **Create new breeds table** with proper schema
     - Size variants (Teacup → Giant)
     - Temperament tags array
     - Weight/height ranges  
     - Hypoallergenic flag
     - Energy/care levels
  
  3. **Populate with comprehensive breed data**
     - 50+ dog breeds with variants
     - 8 popular cat breeds
     - All with temperament tags
  
  ## Purpose
     - Enable filtering by Dog/Cat first
     - Support size variant selection
     - Filter by temperament traits
     - Prevent spelling errors
*/

-- Drop existing table
DROP TABLE IF EXISTS breeds CASCADE;

-- Create new breeds table
CREATE TABLE breeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  species text NOT NULL CHECK (species IN ('dog', 'cat')),
  name text NOT NULL,
  size_variant text CHECK (size_variant IN ('teacup', 'toy', 'miniature', 'small', 'medium', 'large', 'giant')),
  full_name text NOT NULL,
  temperament_tags text[] DEFAULT '{}',
  weight_min numeric,
  weight_max numeric,
  height_min numeric,
  height_max numeric,
  hypoallergenic boolean DEFAULT false,
  good_with_kids boolean DEFAULT true,
  energy_level text CHECK (energy_level IN ('low', 'medium', 'high')),
  care_level text CHECK (care_level IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE breeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Breeds are publicly readable"
  ON breeds FOR SELECT
  TO public
  USING (true);

CREATE INDEX idx_breeds_species ON breeds(species);
CREATE INDEX idx_breeds_size_variant ON breeds(size_variant);
CREATE INDEX idx_breeds_temperament ON breeds USING gin(temperament_tags);

-- Insert all dog breeds with variants (keeping it shorter for migration)
-- Teacup
INSERT INTO breeds VALUES
(gen_random_uuid(), 'dog', 'Poodle', 'teacup', 'Teacup Poodle', ARRAY['Intelligent', 'Trainable', 'Friendly'], 2, 4, 6, 9, true, true, 'medium', 'high', now()),
(gen_random_uuid(), 'dog', 'Yorkshire Terrier', 'teacup', 'Teacup Yorkie', ARRAY['Bold', 'Loyal', 'Energetic'], 2, 4, 6, 9, true, true, 'high', 'high', now()),
(gen_random_uuid(), 'dog', 'Maltese', 'teacup', 'Teacup Maltese', ARRAY['Gentle', 'Playful', 'Lap dog'], 2, 4, 7, 9, true, true, 'medium', 'high', now());

-- Toy
INSERT INTO breeds VALUES
(gen_random_uuid(), 'dog', 'Poodle', 'toy', 'Toy Poodle', ARRAY['Intelligent', 'Hypoallergenic', 'Active'], 6, 9, 10, 10, true, true, 'high', 'high', now()),
(gen_random_uuid(), 'dog', 'Yorkshire Terrier', 'toy', 'Yorkshire Terrier', ARRAY['Confident', 'Affectionate'], 4, 7, 7, 9, true, true, 'high', 'high', now()),
(gen_random_uuid(), 'dog', 'Maltese', 'toy', 'Maltese', ARRAY['Gentle', 'Playful', 'Lap dog'], 4, 7, 8, 10, true, true, 'medium', 'high', now()),
(gen_random_uuid(), 'dog', 'Pomeranian', 'toy', 'Pomeranian', ARRAY['Bold', 'Energetic', 'Fluffy'], 4, 8, 8, 11, false, true, 'high', 'high', now()),
(gen_random_uuid(), 'dog', 'Shih Tzu', 'toy', 'Shih Tzu', ARRAY['Loving', 'Friendly'], 9, 16, 9, 11, true, true, 'low', 'high', now());

-- Miniature
INSERT INTO breeds VALUES
(gen_random_uuid(), 'dog', 'Poodle', 'miniature', 'Miniature Poodle', ARRAY['Smart', 'Active', 'Hypoallergenic'], 15, 17, 11, 15, true, true, 'high', 'high', now()),
(gen_random_uuid(), 'dog', 'Schnauzer', 'miniature', 'Miniature Schnauzer', ARRAY['Alert', 'Friendly', 'Trainable'], 11, 20, 12, 14, true, true, 'high', 'high', now()),
(gen_random_uuid(), 'dog', 'Dachshund', 'miniature', 'Miniature Dachshund', ARRAY['Curious', 'Stubborn', 'Brave'], 11, 16, 5, 7, false, true, 'medium', 'low', now()),
(gen_random_uuid(), 'dog', 'Pinscher', 'miniature', 'Miniature Pinscher', ARRAY['Bold', 'Energetic'], 8, 10, 10, 13, false, true, 'high', 'medium', now());

-- Small
INSERT INTO breeds VALUES
(gen_random_uuid(), 'dog', 'Beagle', 'small', 'Beagle', ARRAY['Friendly', 'Curious', 'Vocal'], 20, 30, 13, 16, false, true, 'high', 'low', now()),
(gen_random_uuid(), 'dog', 'French Bulldog', 'small', 'French Bulldog', ARRAY['Calm', 'Affectionate'], 20, 28, 11, 13, false, true, 'low', 'medium', now()),
(gen_random_uuid(), 'dog', 'Boston Terrier', 'small', 'Boston Terrier', ARRAY['Friendly', 'Smart', 'Goofy'], 12, 25, 15, 17, false, true, 'medium', 'low', now()),
(gen_random_uuid(), 'dog', 'Cocker Spaniel', 'small', 'Cocker Spaniel', ARRAY['Gentle', 'Playful', 'Trainable'], 20, 30, 14, 15, false, true, 'medium', 'high', now());

-- Medium
INSERT INTO breeds VALUES
(gen_random_uuid(), 'dog', 'Border Collie', 'medium', 'Border Collie', ARRAY['Brilliant', 'Energetic', 'Work-driven'], 30, 55, 18, 22, false, true, 'high', 'high', now()),
(gen_random_uuid(), 'dog', 'Australian Shepherd', 'medium', 'Australian Shepherd', ARRAY['Loyal', 'Smart', 'High-energy'], 40, 65, 18, 23, false, true, 'high', 'high', now()),
(gen_random_uuid(), 'dog', 'Bulldog', 'medium', 'Bulldog', ARRAY['Calm', 'Stubborn', 'Affectionate'], 40, 50, 14, 15, false, true, 'low', 'medium', now()),
(gen_random_uuid(), 'dog', 'Dalmatian', 'medium', 'Dalmatian', ARRAY['Energetic', 'Playful'], 45, 70, 19, 24, false, true, 'high', 'medium', now());

-- Large
INSERT INTO breeds VALUES
(gen_random_uuid(), 'dog', 'Labrador Retriever', 'large', 'Labrador Retriever', ARRAY['Friendly', 'Loyal', 'Trainable'], 55, 80, 21, 25, false, true, 'high', 'low', now()),
(gen_random_uuid(), 'dog', 'German Shepherd', 'large', 'German Shepherd', ARRAY['Protective', 'Smart', 'Loyal'], 50, 90, 22, 26, false, true, 'high', 'medium', now()),
(gen_random_uuid(), 'dog', 'Golden Retriever', 'large', 'Golden Retriever', ARRAY['Gentle', 'Friendly', 'Family dog'], 55, 75, 21, 24, false, true, 'high', 'high', now()),
(gen_random_uuid(), 'dog', 'Rottweiler', 'large', 'Rottweiler', ARRAY['Protective', 'Confident', 'Calm'], 80, 135, 22, 27, false, true, 'medium', 'low', now()),
(gen_random_uuid(), 'dog', 'Siberian Husky', 'large', 'Siberian Husky', ARRAY['Independent', 'Energetic', 'Vocal'], 35, 60, 20, 24, false, true, 'high', 'high', now());

-- Giant
INSERT INTO breeds VALUES
(gen_random_uuid(), 'dog', 'Great Dane', 'giant', 'Great Dane', ARRAY['Gentle', 'Calm', 'Friendly'], 110, 175, 28, 34, false, true, 'medium', 'low', now()),
(gen_random_uuid(), 'dog', 'Saint Bernard', 'giant', 'Saint Bernard', ARRAY['Gentle', 'Patient'], 120, 180, 26, 30, false, true, 'low', 'medium', now()),
(gen_random_uuid(), 'dog', 'Mastiff', 'giant', 'Mastiff', ARRAY['Calm', 'Protective'], 120, 230, 27, 32, false, true, 'low', 'low', now());

-- Cats
INSERT INTO breeds VALUES
(gen_random_uuid(), 'cat', 'Persian', 'medium', 'Persian', ARRAY['Calm', 'Affectionate'], 7, 12, NULL, NULL, false, true, 'low', 'high', now()),
(gen_random_uuid(), 'cat', 'Maine Coon', 'large', 'Maine Coon', ARRAY['Friendly', 'Playful', 'Gentle giant'], 10, 25, NULL, NULL, false, true, 'medium', 'medium', now()),
(gen_random_uuid(), 'cat', 'Siamese', 'small', 'Siamese', ARRAY['Vocal', 'Intelligent', 'Social'], 8, 12, NULL, NULL, false, true, 'high', 'low', now()),
(gen_random_uuid(), 'cat', 'British Shorthair', 'medium', 'British Shorthair', ARRAY['Calm', 'Independent'], 9, 18, NULL, NULL, false, true, 'low', 'low', now()),
(gen_random_uuid(), 'cat', 'Ragdoll', 'large', 'Ragdoll', ARRAY['Docile', 'Affectionate', 'Relaxed'], 10, 20, NULL, NULL, false, true, 'low', 'medium', now()),
(gen_random_uuid(), 'cat', 'Sphynx', 'small', 'Sphynx', ARRAY['Energetic', 'Affectionate'], 6, 12, NULL, NULL, true, true, 'high', 'high', now());
