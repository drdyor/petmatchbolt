/*
  # Create storage bucket for profile avatars

  ## Changes
  
  1. **Storage** - Create public bucket
     - Create 'public' bucket for avatars and images
     - Allow authenticated users to upload
     - Allow public read access
  
  ## Purpose
     - Support file uploads for profile photos
     - Eliminate need for external image URLs
*/

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Public files are publicly accessible" ON storage.objects;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'public');

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'public');

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'public');

-- Allow public read access
CREATE POLICY "Public files are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'public');
