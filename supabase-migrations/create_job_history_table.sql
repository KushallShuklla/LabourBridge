-- Create job_history table
CREATE TABLE IF NOT EXISTS job_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  work_period TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own job history"
  ON job_history FOR SELECT
  USING (auth.uid() = worker_id OR auth.uid() = employer_id);

CREATE POLICY "Employers can insert job history"
  ON job_history FOR INSERT
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their job history"
  ON job_history FOR UPDATE
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their job history"
  ON job_history FOR DELETE
  USING (auth.uid() = employer_id);

-- Create index for faster queries
CREATE INDEX idx_job_history_worker ON job_history(worker_id);
CREATE INDEX idx_job_history_employer ON job_history(employer_id);
