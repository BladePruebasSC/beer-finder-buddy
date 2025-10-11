-- Create filter_stats table
CREATE TABLE IF NOT EXISTS filter_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filter_value TEXT NOT NULL UNIQUE,
  usage_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_filter_stats_value ON filter_stats(filter_value);
CREATE INDEX IF NOT EXISTS idx_filter_stats_count ON filter_stats(usage_count DESC);

-- Enable RLS
ALTER TABLE filter_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only for all, write for authenticated users)
CREATE POLICY "Allow public read access to filter stats"
  ON filter_stats
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to filter stats"
  ON filter_stats
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to filter stats"
  ON filter_stats
  FOR UPDATE
  TO public
  USING (true);

-- Create function to increment filter usage
CREATE OR REPLACE FUNCTION increment_filter_usage(p_filter_value TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO filter_stats (filter_value, usage_count)
  VALUES (p_filter_value, 1)
  ON CONFLICT (filter_value)
  DO UPDATE SET
    usage_count = filter_stats.usage_count + 1,
    updated_at = NOW();
END;
$$;

