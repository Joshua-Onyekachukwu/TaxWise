-- Drop existing RLS policies
DROP POLICY "Users can view own upload summaries" ON upload_summaries;
DROP POLICY "Users can insert own upload summaries" ON upload_summaries;

-- Link upload_summaries to analysis_sessions instead of uploads
ALTER TABLE upload_summaries DROP COLUMN upload_id;
ALTER TABLE upload_summaries ADD COLUMN analysis_session_id UUID REFERENCES analysis_sessions(id) ON DELETE CASCADE;

-- Recreate RLS policies with the new column
CREATE POLICY "Users can view own upload summaries" ON upload_summaries FOR SELECT USING (
    EXISTS (SELECT 1 FROM analysis_sessions WHERE analysis_sessions.id = upload_summaries.analysis_session_id AND analysis_sessions.user_id = auth.uid())
);
CREATE POLICY "Users can insert own upload summaries" ON upload_summaries FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM analysis_sessions WHERE analysis_sessions.id = upload_summaries.analysis_session_id AND analysis_sessions.user_id = auth.uid())
);
