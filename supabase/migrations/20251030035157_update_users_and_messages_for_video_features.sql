/*
  # Update Users and Messages for Video Features

  ## Changes

  1. **users table** - Add fields for international breeders and WhatsApp
     - `whatsapp_number` (text) - WhatsApp contact (optional)
     - `country` (text) - Country for international breeders
     - `is_international` (boolean) - True for non-Malta breeders

  2. **messages table** - Add message type and media support
     - `message_type` (text) - text, video_call_invite, system
     - `media_url` (text) - Video/image attachments
     - `media_type` (text) - video, image, document
     - `metadata` (jsonb) - Additional data for special message types

  ## Security
     - Existing RLS policies remain unchanged
     - New columns follow same access patterns
*/

-- Update users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'whatsapp_number'
  ) THEN
    ALTER TABLE users ADD COLUMN whatsapp_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'country'
  ) THEN
    ALTER TABLE users ADD COLUMN country text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'is_international'
  ) THEN
    ALTER TABLE users ADD COLUMN is_international boolean DEFAULT false;
  END IF;
END $$;

-- Update messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'message_type'
  ) THEN
    ALTER TABLE messages ADD COLUMN message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'video_call_invite', 'system'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'media_url'
  ) THEN
    ALTER TABLE messages ADD COLUMN media_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'media_type'
  ) THEN
    ALTER TABLE messages ADD COLUMN media_type text CHECK (media_type IN ('video', 'image', 'document'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE messages ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add policy for public viewing of breeder profiles (for contact info)
CREATE POLICY "Anyone can view breeder public profiles"
  ON users FOR SELECT
  TO authenticated
  USING (role IN ('breeder_independent', 'breeder_registered', 'shelter'));
