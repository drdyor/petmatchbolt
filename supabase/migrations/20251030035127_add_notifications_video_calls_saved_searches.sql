/*
  # Notifications, Video Calls, and Saved Searches

  ## New Tables

  1. **user_notification_preferences** - User notification settings
     - `user_id` (uuid, primary key) - References users
     - `heat_cycle_reminders` (boolean) - Fertile window notifications
     - `waitlist_updates` (boolean) - Position changes, births
     - `new_messages` (boolean) - Message notifications
     - `deposit_requests` (boolean) - Payment reminders
     - `new_matches` (boolean) - Saved search matches
     - `delivery_method` (jsonb) - {push: true, email: true, in_app: true}
     - `email_frequency` (text) - instant, daily, weekly
     - `quiet_hours_start` (time) - No notifications start
     - `quiet_hours_end` (time) - No notifications end
     - `updated_at` (timestamptz)

  2. **user_notifications** - Notification history
     - `id` (uuid, primary key)
     - `user_id` (uuid) - References users
     - `type` (text) - heat_cycle, waitlist, message, deposit, match
     - `title` (text) - Notification title
     - `message` (text) - Notification body
     - `link` (text) - Deep link to relevant page
     - `read` (boolean) - Read status
     - `created_at` (timestamptz)

  3. **video_calls** - Scheduled video calls
     - `id` (uuid, primary key)
     - `conversation_id` (uuid) - References conversations
     - `scheduled_time` (timestamptz) - When call is scheduled
     - `platform` (text) - whatsapp, zoom, google_meet, other
     - `meeting_link` (text) - URL to join
     - `status` (text) - scheduled, completed, cancelled
     - `notes` (text) - Additional details
     - `created_by` (uuid) - References users
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  4. **saved_searches** - Buyer search preferences
     - `id` (uuid, primary key)
     - `user_id` (uuid) - References users
     - `name` (text) - Search name like "Golden Retrievers"
     - `criteria` (jsonb) - {species, breed, age_min, age_max, price_max, location}
     - `notify_on_match` (boolean) - Send alerts for new matches
     - `last_notified_at` (timestamptz) - When last alert was sent
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  ## Security
     - Enable RLS on all tables
     - Users can only access their own preferences and notifications
     - Conversation participants can create video calls
     - Users manage their own saved searches
*/

-- Create user_notification_preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  heat_cycle_reminders boolean DEFAULT true,
  waitlist_updates boolean DEFAULT true,
  new_messages boolean DEFAULT true,
  deposit_requests boolean DEFAULT true,
  new_matches boolean DEFAULT true,
  delivery_method jsonb DEFAULT '{"push": true, "email": true, "in_app": true}'::jsonb,
  email_frequency text DEFAULT 'instant' CHECK (email_frequency IN ('instant', 'daily', 'weekly')),
  quiet_hours_start time,
  quiet_hours_end time,
  updated_at timestamptz DEFAULT now()
);

-- Create user_notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text CHECK (type IN ('heat_cycle', 'waitlist', 'message', 'deposit', 'match', 'system')) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create video_calls table
CREATE TABLE IF NOT EXISTS video_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  scheduled_time timestamptz NOT NULL,
  platform text CHECK (platform IN ('whatsapp', 'zoom', 'google_meet', 'facetime', 'other')) NOT NULL,
  meeting_link text,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  notify_on_match boolean DEFAULT true,
  last_notified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Notification preferences policies
CREATE POLICY "Users can view own notification preferences"
  ON user_notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON user_notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON user_notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User notifications policies
CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Video calls policies
CREATE POLICY "Conversation participants can view video calls"
  ON video_calls FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = video_calls.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can create video calls"
  ON video_calls FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = video_calls.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can update video calls"
  ON video_calls FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = video_calls.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = video_calls.conversation_id
      AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
    )
  );

-- Saved searches policies
CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create saved searches"
  ON saved_searches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS user_notifications_user_id_idx ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS user_notifications_read_idx ON user_notifications(read);
CREATE INDEX IF NOT EXISTS user_notifications_created_at_idx ON user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS video_calls_conversation_id_idx ON video_calls(conversation_id);
CREATE INDEX IF NOT EXISTS video_calls_scheduled_time_idx ON video_calls(scheduled_time);
CREATE INDEX IF NOT EXISTS saved_searches_user_id_idx ON saved_searches(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_calls_updated_at
  BEFORE UPDATE ON video_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
