# 🔧 Instrucciones para Aplicar la Actualización de Reseñas

## ⚠️ Problema Detectado

Ya ejecutaste la migración `004_create_reviews_table.sql` original que **NO incluía** el campo `approved` ni eliminaba el `user_email`. Ahora necesitas ejecutar la migración de corrección.

## ✅ Solución: Ejecuta el Script de Corrección

### Paso 1: Abrir Supabase Dashboard

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. En el menú lateral izquierdo, haz clic en **"SQL Editor"**

### Paso 2: Copiar y Ejecutar el Script

1. Abre el archivo: `supabase/FIX_add_approved_to_reviews.sql`
2. Copia **TODO** el contenido del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en el botón **"RUN"** (esquina inferior derecha)

### Paso 3: Verificar que Todo Funciona

Después de ejecutar el script, deberías ver al final una tabla mostrando la estructura de `reviews`:

```
column_name  | data_type | is_nullable
-------------|-----------|-------------
id           | uuid      | NO
beer_id      | uuid      | NO
user_name    | text      | NO
rating       | integer   | NO
comment      | text      | NO
approved     | boolean   | NO
created_at   | timestamp | NO
updated_at   | timestamp | NO
```

**✅ Si ves `approved` en la lista = TODO BIEN**

**❌ Si NO ves `approved` = Algo salió mal, contacta para ayuda**

## 🎉 Cambios Implementados

### 1. **Campo de Email Eliminado** ✅
- Ya NO se pide el email en el formulario de reseñas
- Solo se pide: Nombre, Calificación (estrellas), y Comentario

### 2. **Sistema de Aprobación** ✅
- Las reseñas ahora requieren aprobación
- Por defecto, las reseñas nuevas están `approved: false`
- Solo las reseñas aprobadas son visibles públicamente
- El promedio de calificaciones solo incluye reseñas aprobadas

### 3. **Dashboard con Gestión de Reseñas** ✅
- Nueva pestaña "Reseñas" en el Dashboard
- Muestra todas las reseñas pendientes de aprobación
- Botones para:
  - ✅ **Aprobar** reseña (se hace visible)
  - ❌ **Eliminar** reseña (se elimina permanentemente)
- Información mostrada:
  - Imagen de la cerveza
  - Nombre de la cerveza
  - Nombre del usuario
  - Calificación con estrellas
  - Comentario completo
  - Fecha relativa (ej: "hace 5 minutos")

### 4. **Mensajes al Usuario** ✅
- Cuando un usuario envía una reseña:
  ```
  "¡Reseña enviada! Será visible una vez aprobada por un moderador 🎉"
  ```
- Cuando un moderador aprueba:
  ```
  "Reseña aprobada exitosamente"
  ```
- Cuando un moderador elimina:
  ```
  "Reseña eliminada exitosamente"
  ```

## 🚀 Cómo Usar el Sistema

### Para los Usuarios (Público)
1. Entrar a una cerveza específica
2. Esperar el mensaje de la IA (opcional)
3. Hacer clic en "Escribir una reseña"
4. Llenar el formulario:
   - **Nombre** (requerido)
   - **Calificación** (1-5 estrellas, requerido)
   - **Comentario** (requerido)
5. Enviar
6. Esperar aprobación del moderador

### Para los Moderadores (Dashboard)
1. Iniciar sesión en el Dashboard: `/dashboard`
2. Contraseña: `CDERF`
3. Ir a la pestaña **"Reseñas"**
4. Ver lista de reseñas pendientes
5. Para cada reseña:
   - Ver toda la información
   - Hacer clic en ✅ **"Aprobar"** para hacerla visible
   - Hacer clic en ❌ **"Eliminar"** para rechazarla

## 📊 Políticas de Seguridad (RLS)

Las políticas de Row Level Security configuradas:

1. **Lectura (SELECT)**: Solo reseñas con `approved = true`
2. **Inserción (INSERT)**: Cualquiera puede crear reseñas (automáticamente `approved = false`)
3. **Actualización (UPDATE)**: Permitido (para aprobar reseñas)
4. **Eliminación (DELETE)**: Permitido (para eliminar reseñas)

## 🔍 Archivos Modificados

### Nuevos Archivos Creados:
- ✅ `supabase/migrations/005_update_reviews_remove_email.sql`
- ✅ `supabase/FIX_add_approved_to_reviews.sql` (script de corrección)
- ✅ `src/components/ReviewsManagement.tsx` (componente de gestión)

### Archivos Modificados:
- ✅ `src/integrations/supabase/types.ts` (actualizado con nuevo schema)
- ✅ `src/components/ReviewForm.tsx` (eliminado campo email)
- ✅ `src/hooks/useReviews.ts` (agregados hooks de aprobar/eliminar)
- ✅ `src/pages/Dashboard.tsx` (agregada pestaña de reseñas)
- ✅ `supabase/migrations/004_create_reviews_table.sql` (actualizado)

## ⚡ Después de Ejecutar la Migración

1. **Reinicia tu servidor de desarrollo** si está corriendo:
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

2. **Prueba el sistema**:
   - Ve al sitio web
   - Entra a una cerveza
   - Deja una reseña de prueba
   - Ve al Dashboard
   - Abre la pestaña "Reseñas"
   - Aprueba la reseña
   - Verifica que aparezca en la página de la cerveza

## 🐛 Solución de Problemas

### No veo reseñas en el Dashboard
- Asegúrate de que hay reseñas pendientes (crea una desde el sitio)
- Verifica que ejecutaste el script de corrección
- Revisa la consola del navegador por errores

### Las reseñas no aparecen después de aprobarlas
- Refresca la página
- Verifica que el campo `approved` se actualizó a `true` en Supabase
- Ejecuta en SQL Editor:
  ```sql
  SELECT * FROM public.reviews;
  ```

### Error al aprobar/eliminar reseñas
- Verifica que las políticas RLS estén correctamente configuradas
- Ejecuta el script de corrección nuevamente

## 📞 ¿Necesitas Ayuda?

Si algo no funciona después de ejecutar el script:
1. Copia el error exacto que recibes
2. Toma una captura de pantalla si es visual
3. Comparte el error para ayudarte

## ✨ ¡Listo!

Una vez ejecutes el script de corrección, todo debería funcionar perfectamente. El sistema de reseñas está completamente funcional con moderación incluida. 🎉

