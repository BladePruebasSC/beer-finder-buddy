-- Script de diagnóstico para verificar el estado de las políticas RLS
-- Ejecuta esto para ver qué está pasando

-- 1. Ver todas las políticas de la tabla reviews
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
WHERE tablename = 'reviews'
ORDER BY cmd;

-- 2. Ver la estructura de la tabla reviews
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Ver si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'reviews';

-- 4. Intentar insertar una reseña de prueba
-- Descomenta las siguientes líneas y reemplaza 'beer-id-valido' con un ID real de cerveza
-- INSERT INTO public.reviews (beer_id, user_name, rating, comment, approved)
-- VALUES (
--   'beer-id-valido',
--   'Usuario Test',
--   5,
--   'Comentario de prueba',
--   false
-- );

