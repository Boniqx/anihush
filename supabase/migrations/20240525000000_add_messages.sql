-- Create messages table for chat history
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    companion_id UUID NOT NULL REFERENCES companions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster retrieval of chat history
CREATE INDEX IF NOT EXISTS idx_messages_user_companion ON messages(user_id, companion_id, created_at);

-- RLS Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can read their own messages
CREATE POLICY "Users can read their own messages"
    ON messages FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own messages (and assistant responses via backend)
-- Note: Backend uses service role, so it bypasses RLS, but for client-side inserts (if any)
CREATE POLICY "Users can insert their own messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);
