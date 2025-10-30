/*
  # Allow users to view other profiles

  ## Changes
  
  1. **users table** - Add public read policy
     - Allow authenticated users to read other users' public profiles
     - Respect privacy settings for what data is shown
  
  ## Purpose
     - Enable profile discovery and browsing
     - Support messaging and connections between users
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view other public profiles" ON users;

-- Allow authenticated users to view other profiles
CREATE POLICY "Users can view other public profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (profile_visibility = 'public');
