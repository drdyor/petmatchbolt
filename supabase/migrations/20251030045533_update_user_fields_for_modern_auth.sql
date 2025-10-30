/*
  # Update user fields for modern authentication

  ## Changes
  
  1. **users table** - Update fields
     - Add `username` (text, unique) - Optional username for display
     - Add `first_name` (text) - Just first name, not full name
     - Add `whatsapp_verified` (boolean) - Whether WhatsApp is verified
     - Add `whatsapp_requested_by` (text array) - User IDs who requested WhatsApp
     - Add `auth_provider` (text) - google, apple, email
     - Make `whatsapp_number` optional and not visible by default
  
  ## Purpose
     - Support OAuth providers (Google, Apple)
     - Make WhatsApp optional with verification
     - Allow username instead of full name
     - Add request/share system for WhatsApp
*/

-- Add new fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE users ADD COLUMN username text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE users ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'whatsapp_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN whatsapp_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'whatsapp_requested_by'
  ) THEN
    ALTER TABLE users ADD COLUMN whatsapp_requested_by text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'auth_provider'
  ) THEN
    ALTER TABLE users ADD COLUMN auth_provider text DEFAULT 'email';
  END IF;
END $$;

-- Update show_whatsapp default to false (private by default)
ALTER TABLE users ALTER COLUMN show_whatsapp SET DEFAULT false;

-- Create whatsapp_requests table for request/share system
CREATE TABLE IF NOT EXISTS whatsapp_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES users(id) ON DELETE CASCADE,
  requested_from_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending', 'approved', 'declined')) DEFAULT 'pending',
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, requested_from_id)
);

ALTER TABLE whatsapp_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests"
  ON whatsapp_requests FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid() OR requested_from_id = auth.uid());

CREATE POLICY "Users can create requests"
  ON whatsapp_requests FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update requests they received"
  ON whatsapp_requests FOR UPDATE
  TO authenticated
  USING (requested_from_id = auth.uid())
  WITH CHECK (requested_from_id = auth.uid());
