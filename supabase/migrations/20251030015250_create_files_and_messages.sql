/*
  # Files and Messaging Schema

  ## New Tables

  1. **files** - Store certificates, documents, etc.
     - `id` (uuid, primary key)
     - `owner_id` (uuid) - Who uploaded it
     - `pet_id` (uuid) - Associated pet (optional)
     - `file_name` (text)
     - `file_url` (text) - Supabase Storage URL
     - `file_type` (text) - PDF, image, etc.
     - `file_size` (integer) - In bytes
     - `category` (text) - certificate, health, pedigree, contract
     - `created_at`

  2. **conversations** - Chat threads
     - `id` (uuid, primary key)
     - `participant_1` (uuid) - First user
     - `participant_2` (uuid) - Second user
     - `last_message_at` (timestamptz)
     - `created_at`

  3. **messages** - Individual messages
     - `id` (uuid, primary key)
     - `conversation_id` (uuid)
     - `sender_id` (uuid)
     - `content` (text)
     - `read` (boolean)
     - `created_at`

  ## Security
     - Enable RLS
     - Only conversation participants can read messages
     - Users can upload files for their own pets
*/

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size integer,
  category text CHECK (category IN ('certificate', 'health', 'pedigree', 'contract', 'photo', 'other')),
  created_at timestamptz DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  participant_2 uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Files policies
CREATE POLICY "Users can upload files for own pets"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND (
      pet_id IS NULL
      OR EXISTS (
        SELECT 1 FROM pets
        WHERE pets.id = files.pet_id
        AND pets.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view own files"
  ON files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view files for pets they can see"
  ON files
  FOR SELECT
  TO authenticated
  USING (
    pet_id IN (
      SELECT id FROM pets
      WHERE owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM listings
        WHERE listings.pet_id = pets.id
        AND listings.status = 'live'
      )
    )
  );

CREATE POLICY "Users can delete own files"
  ON files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Conversations policies
CREATE POLICY "Users can view own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS files_owner_id_idx ON files(owner_id);
CREATE INDEX IF NOT EXISTS files_pet_id_idx ON files(pet_id);
CREATE INDEX IF NOT EXISTS conversations_participants_idx ON conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at DESC);
