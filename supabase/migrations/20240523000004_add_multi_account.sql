-- 1. Create Bank Accounts Table
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    currency TEXT DEFAULT 'NGN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add RLS for Bank Accounts
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank accounts" 
    ON bank_accounts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts" 
    ON bank_accounts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts" 
    ON bank_accounts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank accounts" 
    ON bank_accounts FOR DELETE 
    USING (auth.uid() = user_id);

-- 3. Update Uploads Table
ALTER TABLE uploads 
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS file_type TEXT CHECK (file_type IN ('csv', 'pdf', 'excel')) DEFAULT 'csv';

-- 4. Update Transactions Table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS fingerprint TEXT,
ADD COLUMN IF NOT EXISTS is_transfer BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS transfer_match_id UUID REFERENCES transactions(id) ON DELETE SET NULL;

-- 5. Index for Deduplication
CREATE INDEX IF NOT EXISTS idx_transactions_fingerprint ON transactions(fingerprint);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id_date ON transactions(upload_id, date); -- Indirectly helps, but maybe we need account_id on transactions too? 
-- Actually, transactions link to upload, upload links to account. 
-- For efficient transfer checking, we might want to query by account, but we can join.
-- Let's keep it simple for now.

-- 6. Trigger to update updated_at on bank_accounts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON bank_accounts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
