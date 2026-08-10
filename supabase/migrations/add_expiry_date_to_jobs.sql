-- Add expiry_date column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS expiry_date DATE;
