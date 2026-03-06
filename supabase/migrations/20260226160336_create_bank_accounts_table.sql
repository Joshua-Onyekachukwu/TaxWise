-- Create bank_accounts table
CREATE TABLE public.bank_accounts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bank_name text NOT NULL,
    account_name text NOT NULL,
    account_number text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT bank_accounts_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own bank accounts" ON public.bank_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank accounts" ON public.bank_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts" ON public.bank_accounts
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts" ON public.bank_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Add bank_account_id to uploads table
ALTER TABLE public.uploads
    ADD COLUMN bank_account_id uuid NULL REFERENCES public.bank_accounts(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX ix_uploads_bank_account_id ON public.uploads(bank_account_id);
