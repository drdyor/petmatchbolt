/*
  # Add onboarding completion tracking

  ## Changes
  
  1. **users table** - Add onboarding_completed field
     - `onboarding_completed` (boolean) - Tracks if user finished onboarding
  
  ## Purpose
     - Track which users have completed the onboarding flow
     - Redirect incomplete users to onboarding
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE users ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
END $$;
