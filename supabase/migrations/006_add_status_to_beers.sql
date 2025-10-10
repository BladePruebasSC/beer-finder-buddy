-- Agregar columna status a la tabla beers
-- Los valores posibles son: 'activo' (disponible) y 'agotado' (no disponible pero visible)

ALTER TABLE beers 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'agotado'));

-- Crear índice para mejorar el rendimiento de consultas filtradas por estado
CREATE INDEX IF NOT EXISTS idx_beers_status ON beers(status);

-- Comentario de la columna para documentación
COMMENT ON COLUMN beers.status IS 'Estado del producto: activo (disponible) o agotado (no disponible)';

