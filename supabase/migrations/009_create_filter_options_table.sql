-- Create filter_options table for custom/editable filters
CREATE TABLE IF NOT EXISTS filter_options (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('style', 'color', 'flavor', 'strength', 'bitterness', 'origin')),
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by category
CREATE INDEX IF NOT EXISTS idx_filter_options_category ON filter_options(category);

-- Enable RLS
ALTER TABLE filter_options ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to filter options"
  ON filter_options
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert filter options"
  ON filter_options
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update filter options"
  ON filter_options
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete non-default filter options"
  ON filter_options
  FOR DELETE
  TO authenticated
  USING (is_default = false);

