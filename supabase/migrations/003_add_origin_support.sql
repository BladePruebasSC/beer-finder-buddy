-- Add index for origin field to improve search performance
CREATE INDEX IF NOT EXISTS idx_beers_origin ON public.beers(origin);

-- Add index for style field to improve filter performance
CREATE INDEX IF NOT EXISTS idx_beers_style ON public.beers(style);

-- Add index for color field to improve filter performance
CREATE INDEX IF NOT EXISTS idx_beers_color ON public.beers(color);

-- Add GIN index for flavor array to improve array searches
CREATE INDEX IF NOT EXISTS idx_beers_flavor ON public.beers USING GIN(flavor);

-- Update existing beers with origin values
UPDATE public.beers SET origin = 'Estados Unidos' WHERE name = 'Golden Sunset IPA';
UPDATE public.beers SET origin = 'Estados Unidos' WHERE name = 'Dark Mountain Stout';
UPDATE public.beers SET origin = 'México' WHERE name = 'Sunset Lager';
UPDATE public.beers SET origin = 'República Dominicana' WHERE name = 'Amber Dreams';
UPDATE public.beers SET origin = 'Alemania' WHERE name = 'Wheat Cloud';
UPDATE public.beers SET origin = 'Estados Unidos' WHERE name = 'Hoppy Session';
UPDATE public.beers SET origin = 'Reino Unido' WHERE name = 'Porter del Puerto';
UPDATE public.beers SET origin = 'Estados Unidos' WHERE name = 'Tropical Haze';
UPDATE public.beers SET origin = 'Bélgica' WHERE name = 'Belgian Blonde';
UPDATE public.beers SET origin = 'Irlanda' WHERE name = 'Red Horizon';
UPDATE public.beers SET origin = 'República Checa' WHERE name = 'Pilsner Premium';
UPDATE public.beers SET origin = 'República Dominicana' WHERE name = 'Coconut Milk Stout';

-- Add comment to origin column
COMMENT ON COLUMN public.beers.origin IS 'País o región de origen de la cerveza';

-- Create a view for beer statistics by origin
CREATE OR REPLACE VIEW public.beer_stats_by_origin AS
SELECT 
  origin,
  COUNT(*) as total_beers,
  ROUND(AVG(abv), 2) as avg_abv,
  ROUND(AVG(ibu), 2) as avg_ibu,
  ARRAY_AGG(DISTINCT style) as styles
FROM public.beers
WHERE origin IS NOT NULL
GROUP BY origin
ORDER BY total_beers DESC;

-- Grant access to the view
GRANT SELECT ON public.beer_stats_by_origin TO anon, authenticated;

-- Add constraint to ensure origin matches valid countries (optional - commented out for flexibility)
-- ALTER TABLE public.beers ADD CONSTRAINT valid_origin CHECK (
--   origin IN (
--     'República Dominicana', 'Estados Unidos', 'México', 'Alemania', 'Bélgica',
--     'Reino Unido', 'República Checa', 'Irlanda', 'Países Bajos', 'España',
--     'Colombia', 'Brasil', 'Argentina', 'Chile', 'Japón'
--   )
-- );

