/*
  # Heat Tracking and Litter Management

  ## New Tables

  1. **heat_events** - Track breeding cycle events
     - `id` (uuid, primary key)
     - `pet_id` (uuid) - References pets
     - `event_type` (text) - bleed, flagging, progesterone, mating, whelping
     - `event_date` (date) - When event occurred
     - `numeric_value` (decimal) - For progesterone levels (ng/mL)
     - `notes` (text) - Additional details
     - `photo_url` (text) - Lab results, etc.
     - `created_at` (timestamptz)

  2. **litters** - Expected and born litters
     - `id` (uuid, primary key)
     - `mother_pet_id` (uuid) - References pets (mother)
     - `sire_name` (text) - Father's name
     - `sire_breed` (text) - Father's breed
     - `mating_date` (date) - When bred
     - `expected_whelping` (date) - Calculated (mating + 63 days)
     - `actual_birth_date` (date) - Actual whelping date
     - `expected_count` (integer) - Expected puppies/kittens
     - `actual_count` (integer) - Actual born count
     - `deposit_amount` (integer) - Required deposit in EUR cents
     - `status` (text) - expected, born, available, closed
     - `listing_id` (uuid) - References listings (optional)
     - `created_at`, `updated_at` (timestamptz)

  3. **waitlists** - Buyer waitlist for litters
     - `id` (uuid, primary key)
     - `litter_id` (uuid) - References litters
     - `user_id` (uuid) - References users (buyer)
     - `position` (integer) - Queue position
     - `status` (text) - waiting, deposit_requested, deposit_paid, confirmed, passed, removed
     - `notes` (text) - Breeder notes
     - `joined_at` (timestamptz)
     - `updated_at` (timestamptz)

  4. **deposits** - Payment tracking
     - `id` (uuid, primary key)
     - `waitlist_id` (uuid) - References waitlists
     - `amount` (integer) - Amount in EUR cents
     - `currency` (text) - Default EUR
     - `status` (text) - pending, paid, refunded, applied
     - `payment_method` (text) - bank_transfer, paypal, cash, other
     - `paid_at` (timestamptz) - When marked as paid
     - `notes` (text) - Payment reference, etc.
     - `created_at` (timestamptz)

  ## Security
     - Enable RLS on all tables
     - Pet owners can manage heat events for their pets
     - Litter owners can manage their litters and waitlists
     - Buyers can join waitlists and view their positions
     - Only breeder and buyer involved can see deposit details
*/

-- Create heat_events table
CREATE TABLE IF NOT EXISTS heat_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  event_type text CHECK (event_type IN ('bleed', 'flagging', 'progesterone', 'mating', 'whelping')) NOT NULL,
  event_date date NOT NULL,
  numeric_value decimal(5,2),
  notes text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Create litters table
CREATE TABLE IF NOT EXISTS litters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_pet_id uuid REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  sire_name text NOT NULL,
  sire_breed text,
  mating_date date NOT NULL,
  expected_whelping date NOT NULL,
  actual_birth_date date,
  expected_count integer DEFAULT 0,
  actual_count integer DEFAULT 0,
  deposit_amount integer DEFAULT 0,
  status text DEFAULT 'expected' CHECK (status IN ('expected', 'born', 'available', 'closed')),
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create waitlists table
CREATE TABLE IF NOT EXISTS waitlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  litter_id uuid REFERENCES litters(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  position integer NOT NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'deposit_requested', 'deposit_paid', 'confirmed', 'passed', 'removed')),
  notes text,
  joined_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(litter_id, user_id)
);

-- Create deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_id uuid REFERENCES waitlists(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  currency text DEFAULT 'EUR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'applied')),
  payment_method text CHECK (payment_method IN ('bank_transfer', 'paypal', 'cash', 'other')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE heat_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE litters ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

-- Heat events policies
CREATE POLICY "Pet owners can view heat events for their pets"
  ON heat_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = heat_events.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Pet owners can add heat events"
  ON heat_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = heat_events.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Pet owners can update heat events"
  ON heat_events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = heat_events.pet_id
      AND pets.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = heat_events.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Pet owners can delete heat events"
  ON heat_events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = heat_events.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

-- Litters policies
CREATE POLICY "Breeder can view own litters"
  ON litters FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = litters.mother_pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Breeder can create litters"
  ON litters FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = litters.mother_pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Breeder can update own litters"
  ON litters FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = litters.mother_pet_id
      AND pets.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = litters.mother_pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view available litters"
  ON litters FOR SELECT
  TO authenticated
  USING (status IN ('available', 'born'));

-- Waitlists policies
CREATE POLICY "Breeder can view waitlist for their litters"
  ON waitlists FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM litters
      JOIN pets ON pets.id = litters.mother_pet_id
      WHERE litters.id = waitlists.litter_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can view own waitlist entries"
  ON waitlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Buyers can join waitlists"
  ON waitlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Breeder can update waitlist for their litters"
  ON waitlists FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM litters
      JOIN pets ON pets.id = litters.mother_pet_id
      WHERE litters.id = waitlists.litter_id
      AND pets.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM litters
      JOIN pets ON pets.id = litters.mother_pet_id
      WHERE litters.id = waitlists.litter_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can update own waitlist status"
  ON waitlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Deposits policies
CREATE POLICY "Breeder can view deposits for their waitlists"
  ON deposits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM waitlists
      JOIN litters ON litters.id = waitlists.litter_id
      JOIN pets ON pets.id = litters.mother_pet_id
      WHERE waitlists.id = deposits.waitlist_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can view own deposits"
  ON deposits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM waitlists
      WHERE waitlists.id = deposits.waitlist_id
      AND waitlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Breeder can create and update deposits"
  ON deposits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM waitlists
      JOIN litters ON litters.id = waitlists.litter_id
      JOIN pets ON pets.id = litters.mother_pet_id
      WHERE waitlists.id = deposits.waitlist_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Breeder can update deposits"
  ON deposits FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM waitlists
      JOIN litters ON litters.id = waitlists.litter_id
      JOIN pets ON pets.id = litters.mother_pet_id
      WHERE waitlists.id = deposits.waitlist_id
      AND pets.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM waitlists
      JOIN litters ON litters.id = waitlists.litter_id
      JOIN pets ON pets.id = litters.mother_pet_id
      WHERE waitlists.id = deposits.waitlist_id
      AND pets.owner_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS heat_events_pet_id_idx ON heat_events(pet_id);
CREATE INDEX IF NOT EXISTS heat_events_event_date_idx ON heat_events(event_date DESC);
CREATE INDEX IF NOT EXISTS litters_mother_pet_id_idx ON litters(mother_pet_id);
CREATE INDEX IF NOT EXISTS litters_status_idx ON litters(status);
CREATE INDEX IF NOT EXISTS waitlists_litter_id_idx ON waitlists(litter_id);
CREATE INDEX IF NOT EXISTS waitlists_user_id_idx ON waitlists(user_id);
CREATE INDEX IF NOT EXISTS waitlists_position_idx ON waitlists(position);
CREATE INDEX IF NOT EXISTS deposits_waitlist_id_idx ON deposits(waitlist_id);

-- Trigger for updated_at
CREATE TRIGGER update_litters_updated_at
  BEFORE UPDATE ON litters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waitlists_updated_at
  BEFORE UPDATE ON waitlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
