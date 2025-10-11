  -- Script COMPLETO para arreglar las políticas RLS
  -- Si el anterior no funcionó, ejecuta este desde cero

  -- PASO 1: DESHABILITAR RLS temporalmente para limpiar
  ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

  -- PASO 2: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
  DROP POLICY IF EXISTS "Las reseñas son públicas para lectura" ON public.reviews;
  DROP POLICY IF EXISTS "Las reseñas aprobadas son públicas para lectura" ON public.reviews;
  DROP POLICY IF EXISTS "Cualquiera puede crear reseñas" ON public.reviews;
  DROP POLICY IF EXISTS "Cualquiera puede crear reseñas pendientes" ON public.reviews;
  DROP POLICY IF EXISTS "Permitir actualizar reseñas" ON public.reviews;
  DROP POLICY IF EXISTS "Permitir eliminar reseñas" ON public.reviews;

  -- PASO 3: VERIFICAR que la tabla tiene el campo approved
  DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'reviews' 
      AND column_name = 'approved'
    ) THEN
      ALTER TABLE public.reviews ADD COLUMN approved BOOLEAN DEFAULT false NOT NULL;
    END IF;
  END $$;

  -- PASO 4: HABILITAR RLS de nuevo
  ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

  -- PASO 5: CREAR POLÍTICAS DESDE CERO

  -- Política de SELECT: Solo leer reseñas aprobadas
  CREATE POLICY "reviews_select_approved"
    ON public.reviews
    FOR SELECT
    USING (approved = true);

  -- Política de INSERT: Permitir insertar solo con approved = false
  CREATE POLICY "reviews_insert_pending"
    ON public.reviews
    FOR INSERT
    WITH CHECK (approved = false);

  -- Política de UPDATE: Permitir actualizar (para aprobar reseñas)
  CREATE POLICY "reviews_update_all"
    ON public.reviews
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

  -- Política de DELETE: Permitir eliminar (para rechazar reseñas)
  CREATE POLICY "reviews_delete_all"
    ON public.reviews
    FOR DELETE
    USING (true);

  -- PASO 6: VERIFICAR LAS POLÍTICAS
  SELECT 
    policyname,
    cmd,
    qual,
    with_check
  FROM pg_policies 
  WHERE tablename = 'reviews'
  ORDER BY cmd;

  -- PASO 7: MOSTRAR ESTADO DE RLS
  SELECT 
    tablename,
    rowsecurity as "RLS Habilitado"
  FROM pg_tables
  WHERE tablename = 'reviews';

