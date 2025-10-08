-- Create beers table
CREATE TABLE IF NOT EXISTS public.beers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brewery TEXT NOT NULL,
  style TEXT NOT NULL,
  abv DECIMAL(4,2) NOT NULL,
  ibu INTEGER NOT NULL,
  color TEXT NOT NULL,
  flavor TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  image TEXT,
  origin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.beers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to everyone
CREATE POLICY "Allow public read access"
  ON public.beers
  FOR SELECT
  USING (true);

-- Create policy to allow insert for authenticated users (opcional, puedes ajustar según tus necesidades)
CREATE POLICY "Allow authenticated insert"
  ON public.beers
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow update for authenticated users
CREATE POLICY "Allow authenticated update"
  ON public.beers
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow delete for authenticated users
CREATE POLICY "Allow authenticated delete"
  ON public.beers
  FOR DELETE
  USING (true);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.beers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert initial beer data
INSERT INTO public.beers (name, brewery, style, abv, ibu, color, flavor, description)
VALUES
  ('Golden Sunset IPA', 'Cervecería del Sol', 'IPA', 6.5, 65, 'Dorado', ARRAY['Cítrico', 'Tropical', 'Amargo'], 'IPA americana con intensos aromas a frutas tropicales y cítricos. Final amargo equilibrado.'),
  ('Dark Mountain Stout', 'Montaña Brewing', 'Stout', 7.2, 45, 'Negro', ARRAY['Chocolate', 'Café', 'Tostado'], 'Stout cremosa con notas de chocolate negro y café expreso. Cuerpo completo y sedoso.'),
  ('Sunset Lager', 'Playa Brewery', 'Lager', 4.8, 20, 'Rubio', ARRAY['Suave', 'Malta', 'Refrescante'], 'Lager clásica ligera y refrescante, perfecta para cualquier ocasión. Sabor limpio y crujiente.'),
  ('Amber Dreams', 'Sueños Artesanales', 'Amber Ale', 5.5, 35, 'Ámbar', ARRAY['Caramelo', 'Malta', 'Equilibrado'], 'Amber ale equilibrada con dulzor de malta caramelizada y un toque de lúpulo.'),
  ('Wheat Cloud', 'Nube Cervecera', 'Wheat Beer', 5.0, 15, 'Turbio', ARRAY['Plátano', 'Clavo', 'Suave'], 'Cerveza de trigo con notas de plátano y clavo de olor. Refrescante y aromática.'),
  ('Hoppy Session', 'Lúpulo Loco', 'Session IPA', 4.2, 45, 'Dorado claro', ARRAY['Cítrico', 'Herbal', 'Ligero'], 'Session IPA baja en alcohol pero llena de sabor. Perfecta para varias rondas.'),
  ('Porter del Puerto', 'Mar Brewing', 'Porter', 6.0, 40, 'Marrón oscuro', ARRAY['Chocolate', 'Tostado', 'Ahumado'], 'Porter robusta con maltosidad tostada y toques de chocolate amargo.'),
  ('Tropical Haze', 'Selva Cervecera', 'Hazy IPA', 6.8, 50, 'Turbio dorado', ARRAY['Mango', 'Tropical', 'Jugoso'], 'IPA turbia cargada de lúpulos, con explosión de sabores tropicales y textura jugosa.'),
  ('Belgian Blonde', 'Europa Artesanal', 'Belgian Blonde', 6.5, 25, 'Rubio dorado', ARRAY['Especiado', 'Frutal', 'Malta'], 'Rubia belga con perfil especiado, toques frutales y final seco.'),
  ('Red Horizon', 'Horizonte Brewery', 'Red Ale', 5.8, 42, 'Rojo cobrizo', ARRAY['Caramelo', 'Tostado', 'Cítrico'], 'Red ale con dulzor de caramelo equilibrado con amargor de lúpulo cítrico.'),
  ('Pilsner Premium', 'Clásicos Cerveceros', 'Pilsner', 5.0, 35, 'Dorado brillante', ARRAY['Floral', 'Pan', 'Crujiente'], 'Pilsner bohemia tradicional con amargor noble y final limpio y seco.'),
  ('Coconut Milk Stout', 'Trópico Negro', 'Milk Stout', 6.0, 30, 'Negro', ARRAY['Coco', 'Chocolate', 'Dulce'], 'Milk stout cremosa con coco tostado, chocolate y dulzor equilibrado de lactosa.');

