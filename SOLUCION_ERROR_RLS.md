# 🔧 Solución al Error de RLS al Publicar Reseñas

## ❌ Error que Estás Viendo

```
Error creating review: 
new row violates row-level security policy for table "reviews"
```

## ✅ Causa del Problema

Faltaba la política de RLS para **INSERT** (crear reseñas). La política que permite insertar nuevas reseñas no estaba configurada correctamente.

## 🚀 Solución Rápida (2 Opciones)

### Opción 1: Script Corto (Recomendado - Más Rápido)

1. **Ve a Supabase Dashboard**: https://app.supabase.com
2. **Abre SQL Editor** (menú lateral izquierdo)
3. **Copia y pega** este código:

```sql
-- Eliminar política anterior si existe
DROP POLICY IF EXISTS "Cualquiera puede crear reseñas" ON public.reviews;
DROP POLICY IF EXISTS "Cualquiera puede crear reseñas pendientes" ON public.reviews;

-- Crear política que permite crear reseñas con approved = false
CREATE POLICY "Cualquiera puede crear reseñas pendientes"
  ON public.reviews
  FOR INSERT
  WITH CHECK (approved = false);
```

4. **Haz clic en RUN**
5. **¡Listo!** Ya deberías poder crear reseñas

### Opción 2: Script Completo (Si no ejecutaste el anterior)

1. **Ve a Supabase Dashboard**: https://app.supabase.com
2. **Abre SQL Editor**
3. **Ejecuta todo** el contenido del archivo: `supabase/FIX_add_approved_to_reviews.sql`
4. Este script hace TODO de una vez:
   - Agrega campo `approved`
   - Elimina campo `user_email`
   - Configura TODAS las políticas (incluida la de INSERT)
   - Recrea vistas y triggers

## 🧪 Prueba que Funciona

Después de ejecutar el script:

1. **Ve a tu sitio web**
2. **Entra a cualquier cerveza**
3. **Haz clic en "Escribir una reseña"**
4. **Llena el formulario**:
   - Nombre: "Prueba"
   - Calificación: 5 estrellas
   - Comentario: "Test"
5. **Haz clic en "Publicar reseña"**
6. **Deberías ver**: "¡Reseña enviada! Será visible una vez aprobada por un moderador 🎉"

## ✅ Si Funcionó

Verás el mensaje de éxito y:
- La reseña se guardó en la base de datos
- NO aparece públicamente aún (porque `approved = false`)
- Ve al Dashboard → pestaña "Reseñas" para aprobarla

## ❌ Si Sigue Dando Error

1. **Verifica que ejecutaste el script** sin errores
2. **Verifica las políticas** ejecutando:
   ```sql
   SELECT policyname, cmd, with_check 
   FROM pg_policies 
   WHERE tablename = 'reviews';
   ```
3. **Deberías ver**:
   - `"Las reseñas aprobadas son públicas para lectura"` → SELECT
   - `"Cualquiera puede crear reseñas pendientes"` → INSERT → `(approved = false)`
   - `"Permitir actualizar reseñas"` → UPDATE
   - `"Permitir eliminar reseñas"` → DELETE

## 📋 ¿Por Qué Este Error?

Las políticas de RLS (Row Level Security) controlan quién puede hacer qué con los datos:

- **SELECT** (leer): Solo reseñas con `approved = true`
- **INSERT** (crear): Solo si `approved = false` (esto faltaba)
- **UPDATE** (actualizar): Permitido (para aprobar)
- **DELETE** (eliminar): Permitido (para eliminar)

La política de INSERT es crítica porque sin ella, **nadie puede crear reseñas**.

## 🎯 Archivos Relevantes

1. **`supabase/FIX_RLS_POLICY_REVIEWS.sql`** - Script corto solo para el INSERT
2. **`supabase/FIX_add_approved_to_reviews.sql`** - Script completo (actualizado)

## 💡 Tip

Si en el futuro quieres ver qué políticas tiene una tabla:

```sql
SELECT * FROM pg_policies WHERE tablename = 'reviews';
```

O para ver si una operación específica está permitida:

```sql
-- Probar INSERT
SELECT current_setting('role'); -- Ver tu rol actual
```

## ✨ Después de Arreglarlo

Una vez funcione correctamente:
1. Los usuarios podrán dejar reseñas
2. Las reseñas aparecerán en el Dashboard como "pendientes"
3. Los moderadores podrán aprobarlas o eliminarlas
4. Solo las reseñas aprobadas aparecerán públicamente

¡Eso es todo! 🍺🎉

