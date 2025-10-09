-- Migración para actualizar la tabla de reseñas
-- Elimina el campo de email y agrega campo de aprobación

-- Si la tabla ya existe, hacemos ALTER para agregar el campo approved
DO $$ 
BEGIN
  -- Agregar campo approved si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reviews' 
    AND column_name = 'approved'
  ) THEN
    ALTER TABLE public.reviews ADD COLUMN approved BOOLEAN DEFAULT false NOT NULL;
  END IF;

  -- Eliminar campo user_email si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'reviews' 
    AND column_name = 'user_email'
  ) THEN
    ALTER TABLE public.reviews DROP COLUMN user_email;
  END IF;
END $$;

-- Actualizar política de lectura para mostrar solo reseñas aprobadas
DROP POLICY IF EXISTS "Las reseñas son públicas para lectura" ON public.reviews;
DROP POLICY IF EXISTS "Las reseñas aprobadas son públicas para lectura" ON public.reviews;

CREATE POLICY "Las reseñas aprobadas son públicas para lectura"
  ON public.reviews
  FOR SELECT
  USING (approved = true);

-- Política para permitir actualizaciones (para aprobar reseñas)
CREATE POLICY "Permitir actualizar reseñas"
  ON public.reviews
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política para permitir eliminar reseñas
CREATE POLICY "Permitir eliminar reseñas"
  ON public.reviews
  FOR DELETE
  USING (true);

-- Actualizar vista materializada para incluir solo reseñas aprobadas
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

-- Crear índice único en la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS beer_ratings_stats_beer_id_idx ON beer_ratings_stats(beer_id);

-- Refrescar la vista materializada
REFRESH MATERIALIZED VIEW CONCURRENTLY beer_ratings_stats;

