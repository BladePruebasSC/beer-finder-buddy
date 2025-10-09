-- Script de corrección para las políticas RLS de reviews
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Eliminar política existente de INSERT
DROP POLICY IF EXISTS "Cualquiera puede crear reseñas" ON public.reviews;

-- 2. Crear nueva política de INSERT que permita crear con approved = false
CREATE POLICY "Cualquiera puede crear reseñas pendientes"
  ON public.reviews
  FOR INSERT
  WITH CHECK (approved = false);

-- 3. Verificar que las políticas estén correctas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'reviews';

-- 4. Probar inserción (esto debería funcionar)
-- INSERT INTO public.reviews (beer_id, user_name, rating, comment, approved) 
-- VALUES ('tu-beer-id-aqui', 'Test User', 5, 'Test comment', false);

