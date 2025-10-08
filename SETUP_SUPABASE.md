# 🍺 Guía de Configuración de Supabase para Beer Finder Buddy

## 📋 Resumen de Cambios

Tu proyecto ahora está completamente integrado con Supabase:

- ✅ Base de datos PostgreSQL para almacenar cervezas
- ✅ Supabase Storage para subir imágenes
- ✅ Hooks de React Query para operaciones CRUD
- ✅ Migración de localStorage a Supabase
- ✅ Subida de imágenes desde archivos locales y URLs
- ✅ Filtro por origen de cerveza con índices optimizados
- ✅ Vista de estadísticas por país

## 🚀 Pasos para Configurar Supabase

### 1. Acceder a tu Proyecto de Supabase

Tu proyecto ya está configurado con las credenciales:
- **URL**: `https://dkfnncpeaaxqarzrzkkq.supabase.co`
- **Project ID**: `dkfnncpeaaxqarzrzkkq`

### 2. Aplicar las Migraciones SQL

Tienes dos opciones para aplicar las migraciones:

#### Opción A: Usando el Dashboard de Supabase (Recomendado)

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **SQL Editor**
4. Crea una nueva query
5. Copia y pega el contenido de `supabase/migrations/001_create_beers_table.sql`
6. Haz clic en **Run** o presiona `Ctrl+Enter`
7. Repite el proceso con `supabase/migrations/002_create_storage_bucket.sql`
8. Repite el proceso con `supabase/migrations/003_add_origin_support.sql` ⭐ NUEVO

#### Opción B: Usando Supabase CLI

Si tienes el CLI de Supabase instalado:

```bash
# Asegúrate de estar en el directorio del proyecto
cd beer-finder-buddy

# Vincula tu proyecto
supabase link --project-ref dkfnncpeaaxqarzrzkkq

# Aplica las migraciones
supabase db push
```

### 3. Verificar que las Migraciones se Aplicaron

1. Ve al **SQL Editor** en el Dashboard de Supabase
2. Ejecuta esta query para verificar:

```sql
-- Verificar que la tabla existe
SELECT * FROM beers LIMIT 5;

-- Verificar que el bucket de storage existe
SELECT * FROM storage.buckets WHERE id = 'beer-images';

-- Verificar que las cervezas tienen origen
SELECT name, origin FROM beers;

-- Verificar estadísticas por origen
SELECT * FROM beer_stats_by_origin;
```

Si ambas queries funcionan correctamente, ¡todo está listo! 🎉

### 4. Configurar Políticas de Acceso (Opcional)

Las migraciones ya incluyen políticas de seguridad (RLS - Row Level Security):

**Para la tabla `beers`:**
- ✅ Lectura pública (cualquiera puede ver)
- ✅ Escritura pública (permite crear/editar/eliminar)

**Para el Storage `beer-images`:**
- ✅ Lectura pública (cualquiera puede ver imágenes)
- ✅ Subida permitida para todos

> **Nota de Seguridad**: Las políticas actuales permiten acceso público. Si quieres restringir las operaciones de escritura solo a usuarios autenticados, puedes modificar las políticas en el Dashboard de Supabase > Authentication > Policies.

## 🧪 Probar la Integración

### 1. Iniciar el Proyecto

```bash
npm run dev
```

### 2. Verificar las Funcionalidades

1. **Ver Catálogo**: Ve a `/catalog` - deberías ver las 12 cervezas iniciales
2. **Acceder al Dashboard**: 
   - Ve a `/dashboard`
   - Usa la contraseña: `CDERF`
3. **Crear una Cerveza**:
   - Click en "Nueva Cerveza"
   - Prueba subir una imagen desde tu computadora
   - O usa una URL de imagen
4. **Ver Preview**: Al seleccionar/escribir la imagen, verás un preview
5. **Editar/Eliminar**: Prueba las operaciones CRUD

## 📁 Estructura de Archivos Creados/Modificados

### Nuevos Archivos

- `supabase/migrations/001_create_beers_table.sql` - Esquema de base de datos
- `supabase/migrations/002_create_storage_bucket.sql` - Configuración de storage
- `supabase/migrations/003_add_origin_support.sql` - Soporte de filtros por origen ⭐
- `supabase/migrations/README.md` - Documentación de migraciones
- `src/hooks/useBeers.ts` - Hooks de React Query para operaciones CRUD
- `src/lib/uploadImage.ts` - Utilidades para subir imágenes

### Archivos Modificados

- `src/integrations/supabase/types.ts` - Tipos TypeScript actualizados
- `src/lib/beerStorage.ts` - Migrado de localStorage a Supabase
- `src/pages/Catalog.tsx` - Usa hooks de Supabase
- `src/pages/BeerDetail.tsx` - Usa hooks de Supabase
- `src/pages/Dashboard.tsx` - Añadida subida de archivos

## 🎨 Características de Subida de Imágenes

El Dashboard ahora soporta dos métodos para añadir imágenes:

### 1. Subir Archivo Local
- Formatos aceptados: JPG, PNG, WEBP, GIF
- Tamaño máximo: 5MB
- Preview en tiempo real
- Las imágenes se almacenan en Supabase Storage

### 2. URL Externa
- Pega cualquier URL de imagen
- Útil para imágenes ya hospedadas en internet

**Características adicionales**:
- ❌ Botón para eliminar imagen seleccionada
- 👁️ Preview antes de guardar
- 🔄 Reemplazo automático de imágenes al editar
- ⚠️ Validación de tipo y tamaño de archivo

## 🔧 Solución de Problemas

### Error: "Failed to fetch"
- Verifica que las migraciones se hayan aplicado correctamente
- Asegúrate de que las credenciales en `src/integrations/supabase/client.ts` sean correctas

### Error al subir imágenes
- Verifica que la migración `002_create_storage_bucket.sql` se haya aplicado
- Revisa las políticas del bucket en el Dashboard de Supabase

### Las cervezas no se cargan
- Abre la consola del navegador para ver errores
- Verifica que la tabla `beers` tenga datos (la migración inserta 12 cervezas iniciales)

### Error de CORS
- Las políticas RLS deben estar configuradas correctamente
- Verifica que el bucket `beer-images` esté configurado como público

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de React Query](https://tanstack.com/query/latest)
- [Guía de Supabase Storage](https://supabase.com/docs/guides/storage)

## 🌎 Filtro por Origen

La nueva migración `003_add_origin_support.sql` añade:

- 🔍 **Índices optimizados** para búsquedas rápidas por origen, estilo, color y sabores
- 🌍 **15 países predefinidos** con banderas en el selector
- 📊 **Vista de estadísticas** `beer_stats_by_origin` con datos agregados por país
- 🏷️ **Valores de origen** actualizados en las 12 cervezas iniciales

Los usuarios ahora pueden:
- Filtrar cervezas por país de origen desde la página principal
- Ver estadísticas de cervezas agrupadas por país
- Agregar/editar países desde el dashboard de administración

## 🎉 ¡Listo!

Tu aplicación Beer Finder Buddy ahora está completamente conectada con Supabase. Disfruta de:

- 💾 Base de datos persistente en la nube
- 🖼️ Almacenamiento de imágenes escalable
- 🚀 Operaciones CRUD en tiempo real
- 📱 Sincronización automática entre dispositivos
- 🌎 Filtros avanzados por origen geográfico
- 📊 Estadísticas y análisis de datos

---

**Desarrollado con ❤️ para Beer Finder Buddy**

