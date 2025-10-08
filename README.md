# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/81f5bba3-6eec-493d-955d-97c4578e524a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/81f5bba3-6eec-493d-955d-97c4578e524a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend & Storage)

## Optimizaciones de Imágenes

Este proyecto incluye un sistema completo de optimización de imágenes:

### Características principales:

1. **Compresión automática**: Las imágenes se comprimen automáticamente antes de subirlas, reduciendo el tamaño del archivo mientras mantienen la calidad visual.

2. **Componente OptimizedImage**: Un componente React personalizado que:
   - Muestra un placeholder animado mientras la imagen carga
   - Maneja errores de carga automáticamente
   - Aplica lazy loading para mejorar el rendimiento
   - Soporta diferentes aspect ratios y modos de ajuste (cover/contain)

3. **Procesamiento de imágenes**:
   - Redimensionamiento automático (máx. 1920x1920px)
   - Compresión con calidad 85%
   - Conversión a JPEG para formatos compatibles
   - Soporte para GIF sin compresión

4. **Estilos CSS optimizados**:
   - Clases de utilidad para aspect ratios consistentes
   - Efectos hover suaves
   - Placeholders con gradientes para imágenes no cargadas
   - Renderizado optimizado de imágenes

5. **Caché optimizado**: Las imágenes se sirven con caché de 1 año para máximo rendimiento.

### Uso:

```tsx
import { OptimizedImage } from "@/components/OptimizedImage";

<OptimizedImage
  src={imageUrl}
  alt="Descripción"
  containerClassName="w-full h-48"
  className="object-cover"
  loading="lazy"
  objectFit="cover"
/>
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/81f5bba3-6eec-493d-955d-97c4578e524a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
