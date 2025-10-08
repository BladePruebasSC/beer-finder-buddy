import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "beer-images";
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 0.85;

/**
 * Comprime y redimensiona una imagen
 * @param file Archivo de imagen original
 * @returns Archivo de imagen comprimido
 */
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo el aspect ratio
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto del canvas"));
          return;
        }

        // Mejorar la calidad del renderizado
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("No se pudo comprimir la imagen"));
              return;
            }

            // Crear nuevo archivo con el blob comprimido
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/jpeg',
          QUALITY
        );
      };

      img.onerror = () => reject(new Error("Error al cargar la imagen"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
};

/**
 * Sube una imagen al storage de Supabase
 * @param file El archivo de imagen a subir
 * @param beerId ID único para el archivo (opcional)
 * @returns URL pública de la imagen subida
 */
export const uploadBeerImage = async (
  file: File,
  beerId?: string
): Promise<string> => {
  try {
    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      throw new Error("Tipo de archivo no válido. Usa JPG, PNG, WEBP o GIF.");
    }

    // Validar tamaño (máximo 5MB antes de comprimir)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("La imagen es demasiado grande. El tamaño máximo es 10MB.");
    }

    // Comprimir imagen si no es GIF
    let fileToUpload = file;
    if (file.type !== "image/gif") {
      fileToUpload = await compressImage(file);
      console.log(`Imagen comprimida: ${file.size} → ${fileToUpload.size} bytes`);
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = fileToUpload.type === 'image/jpeg' ? 'jpg' : file.name.split(".").pop();
    const fileName = beerId 
      ? `${beerId}_${timestamp}.${fileExt}`
      : `beer_${timestamp}_${randomString}.${fileExt}`;

    // Subir archivo
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileToUpload, {
        cacheControl: "31536000", // 1 año
        upsert: false,
      });

    if (error) {
      console.error("Error al subir imagen:", error);
      throw new Error(`Error al subir imagen: ${error.message}`);
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error en uploadBeerImage:", error);
    throw error;
  }
};

/**
 * Elimina una imagen del storage de Supabase
 * @param imageUrl URL de la imagen a eliminar
 */
export const deleteBeerImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extraer el path del archivo de la URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(`/object/public/${BUCKET_NAME}/`);
    
    if (pathParts.length < 2) {
      console.warn("No se pudo extraer el path de la imagen");
      return;
    }

    const filePath = pathParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Error al eliminar imagen:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error en deleteBeerImage:", error);
    // No lanzar error para no bloquear otras operaciones
  }
};

/**
 * Reemplaza una imagen antigua con una nueva
 * @param file Nuevo archivo de imagen
 * @param oldImageUrl URL de la imagen antigua (opcional)
 * @param beerId ID de la cerveza
 */
export const replaceBeerImage = async (
  file: File,
  oldImageUrl?: string | null,
  beerId?: string
): Promise<string> => {
  try {
    // Subir nueva imagen
    const newImageUrl = await uploadBeerImage(file, beerId);

    // Eliminar imagen antigua si existe y es de nuestro storage
    if (oldImageUrl && oldImageUrl.includes(BUCKET_NAME)) {
      await deleteBeerImage(oldImageUrl);
    }

    return newImageUrl;
  } catch (error) {
    console.error("Error en replaceBeerImage:", error);
    throw error;
  }
};

