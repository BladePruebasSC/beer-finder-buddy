# Sistema de Reseñas y Calificaciones

## 📝 Descripción

Se ha implementado un sistema completo de reseñas y calificaciones para las cervezas del catálogo. Los usuarios pueden dejar reseñas con calificación de 1 a 5 estrellas, y se muestra el promedio de calificaciones en cada cerveza.

## ✨ Características Implementadas

### 1. **Base de Datos**
- ✅ Nueva tabla `reviews` en Supabase
- ✅ Vista materializada para estadísticas de calificaciones
- ✅ Triggers automáticos para actualizar promedios
- ✅ Row Level Security (RLS) configurado

### 2. **Componentes**
- ✅ `Rating`: Componente de estrellas (interactivo y de solo lectura)
- ✅ `ReviewForm`: Formulario para crear reseñas
- ✅ `ReviewsList`: Lista de reseñas con avatares y fechas

### 3. **Funcionalidades**
- ✅ Mensaje de IA invitando a dejar reseña al entrar a una cerveza
- ✅ Formulario de reseña con validación
- ✅ Calificación con estrellas interactivas
- ✅ Promedio de calificaciones visible en:
  - Detalle de cerveza (esquina superior derecha)
  - Tarjetas del catálogo (esquina superior derecha)
- ✅ Lista de reseñas con fecha relativa (ej: "hace 5 minutos")
- ✅ Imagen de cerveza más grande en la vista de detalle

### 4. **Campos del Formulario**
El formulario solicita:
- Nombre (requerido)
- Email (requerido, validado)
- Calificación de 1-5 estrellas (requerido)
- Comentario (requerido)

**Nota:** No se solicita número de teléfono como lo pediste.

## 🚀 Instrucciones de Instalación

### Paso 1: Aplicar la Migración de Base de Datos

Tienes dos opciones para aplicar la migración:

#### Opción A: Usando Supabase CLI (Recomendado)

Si tienes Supabase CLI instalado y el proyecto vinculado:

```bash
# Desde la raíz del proyecto
supabase db push
```

#### Opción B: Manualmente en el Dashboard de Supabase

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Abre el archivo `supabase/migrations/004_create_reviews_table.sql`
4. Copia todo el contenido
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **RUN** para ejecutar la migración

### Paso 2: Verificar la Migración

Después de aplicar la migración, verifica que se creó correctamente:

1. Ve a **Table Editor** en Supabase
2. Deberías ver una nueva tabla llamada `reviews`
3. Verifica que tenga las siguientes columnas:
   - `id` (UUID)
   - `beer_id` (UUID)
   - `user_name` (TEXT)
   - `user_email` (TEXT)
   - `rating` (INTEGER)
   - `comment` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

### Paso 3: Ejecutar la Aplicación

```bash
npm run dev
```

## 🎯 Cómo Usar el Sistema

### Para Usuarios

1. **Ver Calificaciones:**
   - En el catálogo, cada cerveza muestra su calificación promedio (si tiene reseñas)
   - El número debajo indica cuántas reseñas tiene

2. **Dejar una Reseña:**
   - Entra a una cerveza específica
   - Espera el mensaje de la IA preguntando si quieres dejar una reseña
   - Haz clic en "¡Claro!" o en el botón "Escribir una reseña"
   - Completa el formulario:
     - Nombre
     - Email
     - Calificación (haz clic en las estrellas)
     - Comentario
   - Haz clic en "Publicar reseña"

3. **Ver Reseñas:**
   - En la página de detalle de cada cerveza
   - Scroll hacia abajo para ver todas las reseñas
   - Las reseñas se ordenan de más reciente a más antigua

### Para Desarrolladores

#### Hook `useReviews`

```typescript
import { useReviews, useBeerRating, useCreateReview } from "@/hooks/useReviews";

// Obtener reseñas de una cerveza
const { data: reviews, isLoading } = useReviews(beerId);

// Obtener estadísticas de calificación
const { data: rating } = useBeerRating(beerId);
// rating = { average_rating: 4.5, total_reviews: 10 }

// Crear una reseña
const createReview = useCreateReview();
await createReview.mutateAsync({
  beer_id: beerId,
  user_name: "Juan",
  user_email: "juan@example.com",
  rating: 5,
  comment: "¡Excelente cerveza!"
});
```

#### Componente Rating

```typescript
import { Rating } from "@/components/Rating";

// Solo lectura
<Rating rating={4.5} size={20} />

// Interactivo
<Rating 
  rating={rating} 
  interactive 
  onRatingChange={(newRating) => setRating(newRating)}
  size={32}
/>
```

## 🎨 Mejoras en la Interfaz

### Imagen de Cerveza Ampliada
- La imagen en el detalle ahora es más grande
- Mejor aspecto ratio: 4:3 en móvil, 16:9 en desktop
- Padding adicional para mejor visualización
- Fondo con gradiente sutil

### Mensaje de IA
- Aparece 2 segundos después de cargar la página
- Animación suave de entrada
- Botones para aceptar o cerrar
- Se oculta automáticamente al hacer clic en escribir reseña

### Diseño Responsivo
- Todas las funcionalidades funcionan en móvil y desktop
- Las tarjetas de reseñas se adaptan al tamaño de pantalla
- Las calificaciones se muestran compactas en tarjetas pequeñas

## 📊 Estructura de la Base de Datos

### Tabla `reviews`

| Campo        | Tipo      | Descripción                           |
|-------------|-----------|---------------------------------------|
| id          | UUID      | ID único de la reseña                 |
| beer_id     | UUID      | Referencia a la cerveza               |
| user_name   | TEXT      | Nombre del usuario                    |
| user_email  | TEXT      | Email del usuario                     |
| rating      | INTEGER   | Calificación (1-5)                    |
| comment     | TEXT      | Comentario de la reseña               |
| created_at  | TIMESTAMP | Fecha de creación                     |
| updated_at  | TIMESTAMP | Fecha de última actualización         |

### Vista Materializada `beer_ratings_stats`

Calcula automáticamente:
- Promedio de calificación por cerveza
- Total de reseñas por cerveza
- Fecha de última reseña

## 🔒 Seguridad

- **RLS (Row Level Security)** habilitado
- Políticas de seguridad:
  - ✅ Lectura pública de reseñas
  - ✅ Cualquiera puede crear reseñas
  - ❌ No se permiten modificaciones ni eliminaciones

## 🚧 Posibles Mejoras Futuras

- [ ] Sistema de autenticación para editar/eliminar reseñas propias
- [ ] Reportar reseñas inapropiadas
- [ ] Ordenar reseñas por calificación o fecha
- [ ] Filtrar reseñas por calificación
- [ ] Respuestas a reseñas
- [ ] Imágenes en reseñas
- [ ] Verificación de compra
- [ ] Sistema de votos útiles/no útiles

## 📱 Capturas de Pantalla

### Vista del Catálogo
- Las cervezas muestran su calificación promedio en la esquina superior derecha

### Vista de Detalle
- Imagen más grande y prominente
- Calificación promedio junto al nombre
- Mensaje de IA invitando a dejar reseña
- Botón para escribir reseña
- Formulario de reseña
- Lista de reseñas existentes

## 🐛 Solución de Problemas

### La migración no se aplica
- Verifica que estés conectado a tu proyecto de Supabase
- Asegúrate de tener permisos de administrador
- Intenta ejecutar manualmente en el SQL Editor

### Las reseñas no aparecen
- Verifica en Supabase que la tabla `reviews` existe
- Revisa la consola del navegador por errores
- Asegúrate de que las políticas RLS estén habilitadas

### Las calificaciones no se actualizan
- La vista materializada se actualiza automáticamente
- Si no ves cambios, verifica los triggers en Supabase
- Puedes refrescar manualmente con: `REFRESH MATERIALIZED VIEW CONCURRENTLY beer_ratings_stats;`

## 📝 Notas Técnicas

- **date-fns**: Usado para formatear fechas relativas en español
- **React Query**: Gestiona el caché y estado de las reseñas
- **Sonner**: Notificaciones toast para feedback de usuario
- **Tailwind CSS**: Todas las animaciones y estilos

