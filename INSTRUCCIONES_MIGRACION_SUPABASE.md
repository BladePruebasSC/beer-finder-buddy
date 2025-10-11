# Instrucciones para Migrar Estadísticas de Filtros a Supabase

## Problema
Actualmente, las estadísticas de filtros y las opciones personalizadas se guardan en `localStorage`, lo que significa que solo se almacenan en el navegador local y no se sincronizan entre dispositivos.

## Solución
Migrar estas estadísticas a Supabase para que se guarden en la base de datos y se sincronicen en todos los dispositivos.

## Pasos para Aplicar las Migraciones

### 1. Acceder al Dashboard de Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto "beer-finder-buddy"

### 2. Aplicar la Migración de Estadísticas de Filtros

1. En el menú lateral, ve a **SQL Editor**
2. Haz clic en **+ New query**
3. Copia y pega el contenido del archivo `supabase/migrations/008_create_filter_stats_table.sql`:

```sql
-- Create filter_stats table
CREATE TABLE IF NOT EXISTS filter_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filter_value TEXT NOT NULL UNIQUE,
  usage_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_filter_stats_value ON filter_stats(filter_value);
CREATE INDEX IF NOT EXISTS idx_filter_stats_count ON filter_stats(usage_count DESC);

-- Enable RLS
ALTER TABLE filter_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only for all, write for authenticated users)
CREATE POLICY "Allow public read access to filter stats"
  ON filter_stats
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to filter stats"
  ON filter_stats
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to filter stats"
  ON filter_stats
  FOR UPDATE
  TO public
  USING (true);

-- Create function to increment filter usage
CREATE OR REPLACE FUNCTION increment_filter_usage(p_filter_value TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO filter_stats (filter_value, usage_count)
  VALUES (p_filter_value, 1)
  ON CONFLICT (filter_value)
  DO UPDATE SET
    usage_count = filter_stats.usage_count + 1,
    updated_at = NOW();
END;
$$;
```

4. Haz clic en **Run** para ejecutar la migración
5. Si todo sale bien, deberías ver un mensaje de éxito ✅

### 3. Aplicar la Migración de Opciones de Filtros (Opcional)

Esta migración es para filtros personalizados que los usuarios pueden crear/editar. Solo aplícala si planeas implementar esta funcionalidad en el futuro.

1. En el mismo SQL Editor, crea una **+ New query**
2. Copia y pega el contenido del archivo `supabase/migrations/009_create_filter_options_table.sql`:

```sql
-- Create filter_options table for custom/editable filters
CREATE TABLE IF NOT EXISTS filter_options (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('style', 'color', 'flavor', 'strength', 'bitterness', 'origin')),
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by category
CREATE INDEX IF NOT EXISTS idx_filter_options_category ON filter_options(category);

-- Enable RLS
ALTER TABLE filter_options ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to filter options"
  ON filter_options
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert filter options"
  ON filter_options
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update filter options"
  ON filter_options
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete non-default filter options"
  ON filter_options
  FOR DELETE
  TO authenticated
  USING (is_default = false);
```

3. Haz clic en **Run** para ejecutar la migración
4. Si todo sale bien, deberías ver un mensaje de éxito ✅

### 4. Verificar las Tablas

1. En el menú lateral, ve a **Table Editor**
2. Deberías ver las nuevas tablas:
   - `filter_stats` - Para estadísticas de uso de filtros
   - `filter_options` - Para opciones personalizadas (si la aplicaste)

## ¿Qué Hace la Migración Automáticamente?

Una vez aplicadas las migraciones y desplegada la aplicación:

1. **Estadísticas nuevas**: Se guardarán automáticamente en Supabase
2. **Sincronización**: Las estadísticas se verán en todos los dispositivos
3. **Fallback**: Si Supabase falla, el sistema automáticamente usará localStorage como respaldo
4. **Compatibilidad**: Los datos existentes en localStorage seguirán funcionando

## Migrar Datos Existentes (Opcional)

Si ya tienes estadísticas en localStorage y quieres migrarlas a Supabase:

1. Abre tu aplicación en el navegador
2. Abre la consola de desarrollador (F12)
3. Ve a la pestaña **Console**
4. Ejecuta el siguiente código:

```javascript
// Obtener estadísticas de localStorage
const stats = JSON.parse(localStorage.getItem('beer-filter-stats') || '{}');

// Migrar a Supabase (debes tener supabase importado)
Object.entries(stats).forEach(async ([filterValue, count]) => {
  if (count > 0) {
    await supabase.from('filter_stats').upsert({
      filter_value: filterValue,
      usage_count: count
    }, {
      onConflict: 'filter_value'
    });
  }
});

console.log('✅ Migración completada');
```

## Troubleshooting

### Error: "relation filter_stats already exists"
- **Solución**: La tabla ya existe. Ignora este error o elimina la línea `CREATE TABLE IF NOT EXISTS` y ejecuta solo el resto del script.

### Error: "permission denied"
- **Solución**: Asegúrate de estar conectado como propietario del proyecto en Supabase.

### Las estadísticas no se sincronizan
- **Verificar**: Ve a Supabase → Table Editor → filter_stats y revisa si hay datos
- **Revisar consola**: Abre F12 → Console y busca errores relacionados con Supabase

## Próximos Pasos

Una vez aplicadas las migraciones:

1. Despliega la aplicación actualizada en Netlify
2. Las nuevas búsquedas se guardarán en Supabase automáticamente
3. Las estadísticas se sincronizarán entre todos los dispositivos
4. Puedes limpiar el localStorage con `localStorage.clear()` si quieres (opcional)

## Verificar que Funciona

1. Abre la aplicación en un dispositivo
2. Realiza una búsqueda usando el chat AI
3. Abre la aplicación en otro dispositivo o navegador
4. El mismo filtro debería aparecer como popular en ambos dispositivos

¡Listo! Ahora tu aplicación usará Supabase para sincronizar las estadísticas en todos los dispositivos. 🎉

