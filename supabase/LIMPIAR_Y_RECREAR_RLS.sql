-- Script para LIMPIAR Y RECREAR todas las políticas RLS
-- Este elimina TODAS las políticas posibles y las recrea

-- PASO 1: Eliminar TODAS las políticas posibles (con los nombres antiguos y nuevos)
DROP POLICY IF EXISTS "Las reseñas son públicas para lectura" ON public.reviews;
DROP POLICY IF EXISTS "Las reseñas aprobadas son públicas para lectura" ON public.reviews;
DROP POLICY IF EXISTS "Cualquiera puede crear reseñas" ON public.reviews;
DROP POLICY IF EXISTS "Cualquiera puede crear reseñas pendientes" ON public.reviews;
DROP POLICY IF EXISTS "Permitir actualizar reseñas" ON public.reviews;
DROP POLICY IF EXISTS "Permitir eliminar reseñas" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_approved" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_pending" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_all" ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete_all" ON public.reviews;

-- PASO 2: Crear las políticas correctas

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

-- PASO 3: Verificar que se crearon correctamente
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NULL THEN 'Sin restricción'
    ELSE qual 
  END as "Condición USING",
  CASE 
    WHEN with_check IS NULL THEN 'Sin restricción'
    ELSE with_check 
  END as "Condición WITH CHECK"
FROM pg_policies 
WHERE tablename = 'reviews'
ORDER BY cmd;

-- PASO 4: Confirmar que RLS está habilitado
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ HABILITADO'
    ELSE '❌ DESHABILITADO'
  END as "Estado RLS"
FROM pg_tables
WHERE tablename = 'reviews';

