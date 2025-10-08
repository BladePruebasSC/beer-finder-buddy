import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "beer-images";

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

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("La imagen es demasiado grande. El tamaño máximo es 5MB.");
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split(".").pop();
    const fileName = beerId 
      ? `${beerId}_${timestamp}.${fileExt}`
      : `beer_${timestamp}_${randomString}.${fileExt}`;

    // Subir archivo
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
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

