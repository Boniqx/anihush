-- Add columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS hush_coins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tx_hash TEXT NOT NULL UNIQUE,
    amount_eth DECIMAL NOT NULL,
    coins_granted INTEGER NOT NULL,
    status TEXT DEFAULT 'pending', -- 'confirmed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own transactions
CREATE POLICY "Users can view own transactions" 
ON transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for service role/backend to insert transactions (or authenticated users via API if doing client-side insert, but we are doing backend insert using service key usually, or the backend user. For now, let's allow authenticated insert if the user_id matches, although strictly backend should handle this. Given the setup, we'll allow insert for now to be safe, but typically this is backend-only)
-- Actually, the backend connects as a Postgres user or service role. If it's a Go backend using a connection string, it likely has full access.
