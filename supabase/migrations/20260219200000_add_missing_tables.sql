-- Add missing tables from Phase 1 requirements

-- Tax Settings Table
CREATE TABLE tax_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tax_year_start_month SMALLINT DEFAULT 1, -- e.g., 1 for January
    tax_year_start_day SMALLINT DEFAULT 1, -- e.g., 1 for the first day
    tax_bracket JSONB, -- { "rate": 0.2, "threshold": 50000 }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Tax Settings
ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own tax settings" ON tax_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Reminders Table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    notification_preferences JSONB, -- { "email": true, "in_app": true }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Reminders
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own reminders" ON reminders
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
