-- Revert changes from 20260219120000_update_summaries_link.sql

-- Drop new RLS policies
DROP POLICY "Users can view own upload summaries" ON upload_summaries;
DROP POLICY "Users can insert own upload summaries" ON upload_summaries;

-- Revert table structure
ALTER TABLE upload_summaries DROP COLUMN analysis_session_id;
ALTER TABLE upload_summaries ADD COLUMN upload_id UUID REFERENCES uploads(id) ON DELETE CASCADE;

-- Recreate old RLS policies
CREATE POLICY "Users can view own upload summaries" ON upload_summaries FOR SELECT USING (
    EXISTS (SELECT 1 FROM uploads WHERE uploads.id = upload_summaries.upload_id AND uploads.user_id = auth.uid())
);
CREATE POLICY "Users can insert own upload summaries" ON upload_summaries FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM uploads WHERE uploads.id = upload_summaries.upload_id AND uploads.user_id = auth.uid())
);
