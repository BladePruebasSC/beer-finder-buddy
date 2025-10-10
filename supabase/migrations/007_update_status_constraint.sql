-- Actualizar el constraint de status para usar 'disponible' en lugar de 'activo'

-- Primero eliminar el constraint antiguo si existe
ALTER TABLE beers DROP CONSTRAINT IF EXISTS beers_status_check;

-- Actualizar valores existentes de 'activo' a 'disponible'
UPDATE beers SET status = 'disponible' WHERE status = 'activo';

-- Crear el nuevo constraint con 'disponible'
ALTER TABLE beers 
ADD CONSTRAINT beers_status_check CHECK (status IN ('disponible', 'agotado'));

-- Asegurar que la columna existe con el valor por defecto correcto
ALTER TABLE beers ALTER COLUMN status SET DEFAULT 'disponible';

-- Actualizar el comentario
COMMENT ON COLUMN beers.status IS 'Estado del producto: disponible (disponible) o agotado (no disponible)';

