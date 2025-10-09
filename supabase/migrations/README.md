# Migraciones de Base de Datos

Este directorio contiene las migraciones de Supabase para el proyecto Beer Finder Buddy.

## Orden de Migraciones

Las migraciones deben ejecutarse en el siguiente orden:

### 1. `001_create_beers_table.sql`
Crea la tabla principal de cervezas con los siguientes campos:
- `id`: UUID (primary key)
- `name`: Nombre de la cerveza
- `brewery`: Nombre de la cervecería
- `style`: Estilo de cerveza (IPA, Stout, Lager, etc.)
- `abv`: Porcentaje de alcohol
- `ibu`: Amargor (International Bitterness Units)
- `color`: Color de la cerveza
- `flavor`: Array de sabores
- `description`: Descripción
- `image`: URL de la imagen
- `origin`: País o región de origen
- `created_at`: Timestamp de creación
- `updated_at`: Timestamp de última actualización

También incluye:
- Políticas de RLS (Row Level Security)
- Trigger para actualizar `updated_at` automáticamente
- Datos iniciales de 12 cervezas

### 2. `002_create_storage_bucket.sql`
Configura el bucket de almacenamiento para las imágenes de cervezas:
- Crea el bucket `beer-images`
- Configura políticas para lectura pública
- Permite subida/actualización/eliminación autenticada

### 3. `003_add_origin_support.sql`
Mejora el soporte para filtros por origen:
- Agrega índices para mejorar el rendimiento de búsquedas
  - Índice para `origin`
  - Índice para `style`
  - Índice para `color`
  - Índice GIN para `flavor` (array)
- Actualiza las cervezas existentes con valores de origen
- Crea una vista `beer_stats_by_origin` con estadísticas
- Agrega comentarios a la columna `origin`

### 4. `004_create_reviews_table.sql` ⭐ NUEVO
Crea el sistema completo de reseñas y calificaciones:
- Tabla `reviews` con los siguientes campos:
  - `id`: UUID (primary key)
  - `beer_id`: Referencia a la cerveza
  - `user_name`: Nombre del usuario
  - `user_email`: Email del usuario
  - `rating`: Calificación de 1 a 5
  - `comment`: Comentario de la reseña
  - `created_at`: Fecha de creación
  - `updated_at`: Fecha de actualización
- Vista materializada `beer_ratings_stats` para estadísticas
- Triggers automáticos para actualizar promedios
- Políticas RLS para lectura pública y creación abierta

## Cómo Ejecutar las Migraciones

### Opción 1: Usando Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI si no lo tienes
npm install -g supabase

# 2. Iniciar el proyecto local
supabase start

# 3. Aplicar todas las migraciones
supabase db reset

# 4. O aplicar migraciones nuevas solamente
supabase db push
```

### Opción 2: Usando el Dashboard de Supabase

1. Ve a tu proyecto en https://supabase.com
2. Navega a "SQL Editor" en el menú lateral
3. Copia y pega el contenido de cada archivo .sql en orden
4. Ejecuta cada migración una por una

### Opción 3: Manualmente con psql

```bash
psql -h [YOUR_DB_HOST] -U postgres -d postgres -f supabase/migrations/001_create_beers_table.sql
psql -h [YOUR_DB_HOST] -U postgres -d postgres -f supabase/migrations/002_create_storage_bucket.sql
psql -h [YOUR_DB_HOST] -U postgres -d postgres -f supabase/migrations/003_add_origin_support.sql
psql -h [YOUR_DB_HOST] -U postgres -d postgres -f supabase/migrations/004_create_reviews_table.sql
```

## Verificar las Migraciones

Para verificar que todo se ejecutó correctamente:

```sql
-- Verificar que la tabla de cervezas existe
SELECT * FROM public.beers LIMIT 5;

-- Verificar que la tabla de reseñas existe
SELECT * FROM public.reviews LIMIT 5;

-- Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('beers', 'reviews');

-- Verificar la vista de estadísticas de origen
SELECT * FROM public.beer_stats_by_origin;

-- Verificar la vista materializada de calificaciones
SELECT * FROM public.beer_ratings_stats;

-- Verificar que las cervezas tienen origen
SELECT name, origin FROM public.beers;
```

## Revertir Migraciones (Rollback)

Si necesitas revertir la última migración:

### Para 004_create_reviews_table.sql
```sql
-- Eliminar triggers
DROP TRIGGER IF EXISTS refresh_stats_on_review_change ON public.reviews;
DROP TRIGGER IF EXISTS update_reviews_updated_at_trigger ON public.reviews;

-- Eliminar funciones
DROP FUNCTION IF EXISTS refresh_beer_ratings_stats();
DROP FUNCTION IF EXISTS update_reviews_updated_at();

-- Eliminar vista materializada
DROP MATERIALIZED VIEW IF EXISTS public.beer_ratings_stats;

-- Eliminar tabla de reseñas
DROP TABLE IF EXISTS public.reviews;
```

### Para 003_add_origin_support.sql
```sql
-- Eliminar vista
DROP VIEW IF EXISTS public.beer_stats_by_origin;

-- Eliminar índices
DROP INDEX IF EXISTS idx_beers_origin;
DROP INDEX IF EXISTS idx_beers_style;
DROP INDEX IF EXISTS idx_beers_color;
DROP INDEX IF EXISTS idx_beers_flavor;

-- Limpiar origen (opcional)
UPDATE public.beers SET origin = NULL;
```

## Notas Importantes

- Las migraciones están diseñadas para ser idempotentes (pueden ejecutarse múltiples veces)
- Se usa `IF NOT EXISTS` y `IF EXISTS` para evitar errores
- Los datos de origen se asignan automáticamente a las cervezas existentes
- La vista `beer_stats_by_origin` se actualiza automáticamente con los datos

## Países Soportados

La aplicación soporta los siguientes países/regiones en el filtro de origen:

- 🇩🇴 República Dominicana
- 🇺🇸 Estados Unidos
- 🇲🇽 México
- 🇩🇪 Alemania
- 🇧🇪 Bélgica
- 🇬🇧 Reino Unido
- 🇨🇿 República Checa
- 🇮🇪 Irlanda
- 🇳🇱 Países Bajos
- 🇪🇸 España
- 🇨🇴 Colombia
- 🇧🇷 Brasil
- 🇦🇷 Argentina
- 🇨🇱 Chile
- 🇯🇵 Japón

Los países pueden agregarse o modificarse desde el dashboard de administración.

## Desarrollo Local

Para desarrollo local con datos de prueba:

```bash
# Reset completo de la base de datos
supabase db reset

# Esto ejecutará todas las migraciones en orden
```

## Producción

En producción, Supabase ejecuta automáticamente las migraciones nuevas cuando haces push al repositorio (si tienes configurado el CLI y GitHub Actions).

```bash
# Vincular tu proyecto
supabase link --project-ref [YOUR_PROJECT_REF]

# Aplicar migraciones a producción
supabase db push
```

