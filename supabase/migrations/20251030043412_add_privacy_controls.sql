/*
  # Add privacy controls to users

  ## Changes
  
  1. **users table** - Add privacy settings
     - `profile_visibility` (text) - public, friends_only, private
     - `show_location` (boolean) - Show location to others
     - `show_whatsapp` (boolean) - Show WhatsApp to others
     - `show_email` (boolean) - Show email to others
  
  ## Purpose
     - Allow users to control what information is visible
     - Support public, friends-only, and private profiles
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profile_visibility'
  ) THEN
    ALTER TABLE users ADD COLUMN profile_visibility text DEFAULT 'public';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'show_location'
  ) THEN
    ALTER TABLE users ADD COLUMN show_location boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'show_whatsapp'
  ) THEN
    ALTER TABLE users ADD COLUMN show_whatsapp boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'show_email'
  ) THEN
    ALTER TABLE users ADD COLUMN show_email boolean DEFAULT false;
  END IF;
END $$;
