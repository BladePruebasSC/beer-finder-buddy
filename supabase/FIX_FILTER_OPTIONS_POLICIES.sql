-- Fix RLS policies for filter_options table to allow public access
-- This fixes the issue where filter updates weren't being saved

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Allow public read access to filter options" ON filter_options;
DROP POLICY IF EXISTS "Allow authenticated users to insert filter options" ON filter_options;
DROP POLICY IF EXISTS "Allow public users to insert filter options" ON filter_options;
DROP POLICY IF EXISTS "Allow authenticated users to update filter options" ON filter_options;
DROP POLICY IF EXISTS "Allow public users to update filter options" ON filter_options;
DROP POLICY IF EXISTS "Allow authenticated users to delete non-default filter options" ON filter_options;
DROP POLICY IF EXISTS "Allow public users to delete non-default filter options" ON filter_options;

-- Recreate all policies with proper access
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

CREATE POLICY "Allow public users to insert filter options"
  ON filter_options
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update filter options"
  ON filter_options
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow public users to update filter options"
  ON filter_options
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to delete non-default filter options"
  ON filter_options
  FOR DELETE
  TO authenticated
  USING (is_default = false);

CREATE POLICY "Allow public users to delete non-default filter options"
  ON filter_options
  FOR DELETE
  TO public
  USING (is_default = false);
