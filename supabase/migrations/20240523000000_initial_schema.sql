-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core User Profile
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    country_code TEXT DEFAULT 'NG',
    currency_code TEXT DEFAULT 'NGN',
    tax_year_start DATE DEFAULT '2024-01-01',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploads Tracking
CREATE TABLE uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    filename TEXT NOT NULL,
    status TEXT CHECK (status IN ('processing', 'waiting_input', 'completed', 'failed')) DEFAULT 'processing',
    parsing_profile JSONB, -- Stores adapter used, column mapping
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE, -- Null for system defaults
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    is_system_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Normalized Ledger
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    upload_id UUID REFERENCES uploads(id) ON DELETE SET NULL,
    
    -- Normalized Fields
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL, -- Always positive
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL, 
    currency TEXT DEFAULT 'NGN',
    
    -- Categorization & Tax
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_deductible BOOLEAN DEFAULT FALSE,
    deductible_confidence NUMERIC(3, 2), -- AI confidence
    
    -- Metadata
    raw_row JSONB, -- For debugging
    status TEXT DEFAULT 'pending_review', -- pending_review, approved
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rules for Auto-Categorization
CREATE TABLE rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    match_field TEXT NOT NULL, -- 'description', 'amount', etc.
    match_pattern TEXT NOT NULL, -- 'contains:Uber'
    action_category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    action_deductible BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'monthly_summary', 'accountant_pack'
    period_start DATE,
    period_end DATE,
    file_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Audit Log
CREATE TABLE ai_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    input_payload JSONB,
    output_payload JSONB,
    model_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NEW: Upload Summaries (Pre-computed stats for dashboards)
CREATE TABLE upload_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id UUID REFERENCES uploads(id) ON DELETE CASCADE,
    income_total NUMERIC(12, 2) DEFAULT 0,
    expense_total NUMERIC(12, 2) DEFAULT 0,
    net_total NUMERIC(12, 2) DEFAULT 0,
    by_category JSONB, -- { "Transport": { amount: 100, percent: 10 }, ... }
    by_month JSONB, -- { "2024-01": { income: 500, expense: 200 }, ... }
    top_merchants JSONB, -- [{ name: "Uber", amount: 500, count: 10 }, ...]
    largest_transactions JSONB, -- { income: [...], expense: [...] }
    uncategorized_count INTEGER DEFAULT 0,
    quality_flags JSONB, -- { duplicates: 2, multi_currency: false, ... }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NEW: Deduction Reviews (User decisions on specific items)
CREATE TABLE deduction_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    user_decision TEXT CHECK (user_decision IN ('business', 'mixed', 'personal')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Uploads
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own uploads" ON uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own uploads" ON uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own uploads" ON uploads FOR UPDATE USING (auth.uid() = user_id);

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own categories or system defaults" ON categories FOR SELECT USING (auth.uid() = user_id OR is_system_default = TRUE);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Rules
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own rules" ON rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own rules" ON rules FOR ALL USING (auth.uid() = user_id);

-- Reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI Audit Logs
ALTER TABLE ai_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own logs" ON ai_audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert logs" ON ai_audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Upload Summaries
ALTER TABLE upload_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own upload summaries" ON upload_summaries FOR SELECT USING (
    EXISTS (SELECT 1 FROM uploads WHERE uploads.id = upload_summaries.upload_id AND uploads.user_id = auth.uid())
);
CREATE POLICY "Users can insert own upload summaries" ON upload_summaries FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM uploads WHERE uploads.id = upload_summaries.upload_id AND uploads.user_id = auth.uid())
);

-- Deduction Reviews
ALTER TABLE deduction_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own deduction reviews" ON deduction_reviews FOR SELECT USING (
    EXISTS (SELECT 1 FROM transactions WHERE transactions.id = deduction_reviews.transaction_id AND transactions.user_id = auth.uid())
);
CREATE POLICY "Users can manage own deduction reviews" ON deduction_reviews FOR ALL USING (
    EXISTS (SELECT 1 FROM transactions WHERE transactions.id = deduction_reviews.transaction_id AND transactions.user_id = auth.uid())
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
