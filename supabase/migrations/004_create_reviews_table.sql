-- Crear tabla de reseñas
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  beer_id UUID NOT NULL REFERENCES public.beers(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  approved BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear índice para búsquedas rápidas por cerveza
CREATE INDEX IF NOT EXISTS reviews_beer_id_idx ON public.reviews(beer_id);

-- Crear índice para ordenar por fecha
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Política para permitir a todos leer solo las reseñas aprobadas
CREATE POLICY "Las reseñas aprobadas son públicas para lectura"
  ON public.reviews
  FOR SELECT
  USING (approved = true);

-- Política para permitir a cualquiera insertar reseñas
CREATE POLICY "Cualquiera puede crear reseñas"
  ON public.reviews
  FOR INSERT
  WITH CHECK (true);

-- Función para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente updated_at
CREATE TRIGGER update_reviews_updated_at_trigger
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- Vista materializada para calcular estadísticas de calificaciones por cerveza (solo aprobadas)
CREATE MATERIALIZED VIEW IF NOT EXISTS beer_ratings_stats AS
SELECT 
  beer_id,
  COUNT(*) as total_reviews,
  AVG(rating)::numeric(3,2) as average_rating,
  MAX(created_at) as last_review_date
FROM public.reviews
WHERE approved = true
GROUP BY beer_id;

-- Crear índice único en la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS beer_ratings_stats_beer_id_idx ON beer_ratings_stats(beer_id);

-- Función para refrescar las estadísticas
CREATE OR REPLACE FUNCTION refresh_beer_ratings_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY beer_ratings_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas cuando se inserta o actualiza una reseña
CREATE TRIGGER refresh_stats_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_beer_ratings_stats();

