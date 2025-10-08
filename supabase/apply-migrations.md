# 🚀 Aplicar Migraciones Rápidamente

## Usando el SQL Editor de Supabase

Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard) y ejecuta los siguientes scripts en orden:

---

### Paso 1: Verificar Estado Actual

```sql
-- Ver si ya existe la tabla
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'beers'
) as table_exists;

-- Ver cuántas cervezas hay
SELECT COUNT(*) as total_beers FROM public.beers;

-- Ver si existe el bucket
SELECT * FROM storage.buckets WHERE id = 'beer-images';
```

---

### Paso 2: Aplicar Migración 001 (si no existe la tabla)

Copia y pega el contenido completo de: `001_create_beers_table.sql`

---

### Paso 3: Aplicar Migración 002 (si no existe el bucket)

Copia y pega el contenido completo de: `002_create_storage_bucket.sql`

---

### Paso 4: Aplicar Migración 003 (Filtro de Origen) ⭐

Copia y pega el contenido completo de: `003_add_origin_support.sql`

Esta migración:
- ✅ Crea índices para mejorar el rendimiento
- ✅ Asigna países a las 12 cervezas iniciales
- ✅ Crea una vista de estadísticas por origen

---

### Paso 5: Verificar que Todo Funcionó

```sql
-- Ver todas las cervezas con su origen
SELECT name, brewery, origin FROM public.beers;

-- Ver estadísticas por país
SELECT * FROM public.beer_stats_by_origin;

-- Ver los índices creados
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'beers'
ORDER BY indexname;

-- Verificar la distribución de cervezas por origen
SELECT 
    origin,
    COUNT(*) as cantidad
FROM public.beers
GROUP BY origin
ORDER BY cantidad DESC;
```

---

## Resultados Esperados

Después de ejecutar todas las migraciones, deberías ver:

### Cervezas con Origen Asignado:
- 🇺🇸 **Estados Unidos**: 4 cervezas (Golden Sunset IPA, Dark Mountain Stout, Hoppy Session, Tropical Haze)
- 🇩🇴 **República Dominicana**: 2 cervezas (Amber Dreams, Coconut Milk Stout)
- 🇲🇽 **México**: 1 cerveza (Sunset Lager)
- 🇩🇪 **Alemania**: 1 cerveza (Wheat Cloud)
- 🇬🇧 **Reino Unido**: 1 cerveza (Porter del Puerto)
- 🇧🇪 **Bélgica**: 1 cerveza (Belgian Blonde)
- 🇮🇪 **Irlanda**: 1 cerveza (Red Horizon)
- 🇨🇿 **República Checa**: 1 cerveza (Pilsner Premium)

### Índices Creados:
- `idx_beers_origin` - Para búsquedas rápidas por país
- `idx_beers_style` - Para búsquedas rápidas por estilo
- `idx_beers_color` - Para búsquedas rápidas por color
- `idx_beers_flavor` - Para búsquedas rápidas en el array de sabores (GIN index)

### Vista Disponible:
- `beer_stats_by_origin` - Estadísticas agregadas por país (total, ABV promedio, IBU promedio, estilos)

---

## Troubleshooting

### Error: "relation already exists"
Si ves este error, significa que ya ejecutaste la migración. Puedes ignorarlo o saltar a la siguiente migración.

### Error: "permission denied"
Asegúrate de que estás ejecutando el SQL como usuario con permisos de administrador en Supabase.

### Error: "column origin does not exist"
Esto significa que necesitas ejecutar primero la migración `001_create_beers_table.sql`.

### No se ven las estadísticas
Ejecuta:
```sql
-- Refrescar la vista
REFRESH MATERIALIZED VIEW IF EXISTS beer_stats_by_origin;

-- O simplemente consultar la vista
SELECT * FROM beer_stats_by_origin;
```

---

## 🎉 ¡Listo!

Una vez completadas todas las migraciones, tu base de datos está lista para:
- ✅ Filtrar cervezas por país de origen
- ✅ Ver estadísticas por origen
- ✅ Búsquedas optimizadas con índices
- ✅ Gestión completa desde el dashboard

**Nota**: Los cambios en la base de datos son permanentes. Si necesitas revertir, consulta la sección "Rollback" en el archivo `README.md`.

