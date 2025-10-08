-- Create storage bucket for beer images
INSERT INTO storage.buckets (id, name, public)
VALUES ('beer-images', 'beer-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to beer images
CREATE POLICY "Public read access for beer images"
ON storage.objects FOR SELECT
USING (bucket_id = 'beer-images');

-- Allow authenticated users to upload beer images
CREATE POLICY "Allow upload for beer images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'beer-images');

-- Allow authenticated users to update beer images
CREATE POLICY "Allow update for beer images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'beer-images')
WITH CHECK (bucket_id = 'beer-images');

-- Allow authenticated users to delete beer images
CREATE POLICY "Allow delete for beer images"
ON storage.objects FOR DELETE
USING (bucket_id = 'beer-images');

