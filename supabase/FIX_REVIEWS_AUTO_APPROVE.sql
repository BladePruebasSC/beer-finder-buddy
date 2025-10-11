-- Script para hacer que las reseñas se muestren automáticamente sin aprobación
-- pero mantener la funcionalidad de eliminación en el dashboard

-- 1. Cambiar la política RLS para mostrar TODAS las reseñas (no solo aprobadas)
DROP POLICY IF EXISTS "Las reseñas aprobadas son públicas para lectura" ON public.reviews;

CREATE POLICY "Todas las reseñas son públicas para lectura"
  ON public.reviews
  FOR SELECT
  USING (true);

-- 2. Cambiar el valor por defecto de approved a true para nuevas reseñas
ALTER TABLE public.reviews 
ALTER COLUMN approved SET DEFAULT true;

-- 3. Actualizar todas las reseñas existentes para que estén aprobadas
UPDATE public.reviews 
SET approved = true 
WHERE approved = false;

-- 4. Actualizar la vista materializada para incluir todas las reseñas
DROP MATERIALIZED VIEW IF EXISTS beer_ratings_stats;

CREATE MATERIALIZED VIEW IF NOT EXISTS beer_ratings_stats AS
SELECT 
  beer_id,
  COUNT(*) as total_reviews,
  AVG(rating)::numeric(3,2) as average_rating,
  MAX(created_at) as last_review_date
FROM public.reviews
-- Removido el filtro WHERE approved = true
GROUP BY beer_id;

-- 5. Recrear el índice único
CREATE UNIQUE INDEX IF NOT EXISTS beer_ratings_stats_beer_id_idx ON beer_ratings_stats(beer_id);

-- 6. Refrescar la vista materializada
REFRESH MATERIALIZED VIEW beer_ratings_stats;
