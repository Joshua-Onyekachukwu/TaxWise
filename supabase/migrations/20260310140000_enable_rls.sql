-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_summaries ENABLE ROW LEVEL SECURITY;

-- Policies for 'profiles' table
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Policies for 'accounts' table
CREATE POLICY "Users can view their own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD on their own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);

-- Policies for 'uploads' table
CREATE POLICY "Users can view their own uploads" ON uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD on their own uploads" ON uploads FOR ALL USING (auth.uid() = user_id);

-- Policies for 'transactions' table
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD on their own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- Policies for 'categories' table
CREATE POLICY "Users can view all categories" ON categories FOR SELECT USING (true);

-- Policies for 'upload_summaries' table
CREATE POLICY "Users can view their own summaries" ON upload_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD on their own summaries" ON upload_summaries FOR ALL USING (auth.uid() = user_id);
