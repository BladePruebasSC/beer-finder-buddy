-- Migración de emergencia para agregar el campo approved y eliminar user_email
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Agregar campo approved si no existe
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false NOT NULL;

-- 2. Eliminar campo user_email si existe (primero verificamos)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reviews' 
    AND column_name = 'user_email'
  ) THEN
    ALTER TABLE public.reviews DROP COLUMN user_email;
  END IF;
END $$;

-- 3. Actualizar política de lectura para mostrar solo reseñas aprobadas
DROP POLICY IF EXISTS "Las reseñas son públicas para lectura" ON public.reviews;
DROP POLICY IF EXISTS "Las reseñas aprobadas son públicas para lectura" ON public.reviews;

CREATE POLICY "Las reseñas aprobadas son públicas para lectura"
  ON public.reviews
  FOR SELECT
  USING (approved = true);

-- 4. Agregar política para permitir crear reseñas (solo con approved = false)
DROP POLICY IF EXISTS "Cualquiera puede crear reseñas" ON public.reviews;
DROP POLICY IF EXISTS "Cualquiera puede crear reseñas pendientes" ON public.reviews;

CREATE POLICY "Cualquiera puede crear reseñas pendientes"
  ON public.reviews
  FOR INSERT
  WITH CHECK (approved = false);

-- 5. Agregar política para permitir actualizaciones (para aprobar reseñas)
DROP POLICY IF EXISTS "Permitir actualizar reseñas" ON public.reviews;

CREATE POLICY "Permitir actualizar reseñas"
  ON public.reviews
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 6. Agregar política para permitir eliminar reseñas
DROP POLICY IF EXISTS "Permitir eliminar reseñas" ON public.reviews;

CREATE POLICY "Permitir eliminar reseñas"
  ON public.reviews
  FOR DELETE
  USING (true);

-- 7. Recrear vista materializada para incluir solo reseñas aprobadas
DROP MATERIALIZED VIEW IF EXISTS beer_ratings_stats;

CREATE MATERIALIZED VIEW beer_ratings_stats AS
SELECT 
  beer_id,
  COUNT(*) as total_reviews,
  AVG(rating)::numeric(3,2) as average_rating,
  MAX(created_at) as last_review_date
FROM public.reviews
WHERE approved = true
GROUP BY beer_id;

-- 8. Crear índice único en la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS beer_ratings_stats_beer_id_idx ON beer_ratings_stats(beer_id);

-- 9. Actualizar trigger para refrescar estadísticas
DROP TRIGGER IF EXISTS refresh_stats_on_review_change ON public.reviews;

CREATE OR REPLACE FUNCTION refresh_beer_ratings_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY beer_ratings_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_stats_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_beer_ratings_stats();

-- 10. Verificar que todo está bien
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND table_schema = 'public'
ORDER BY ordinal_position;

