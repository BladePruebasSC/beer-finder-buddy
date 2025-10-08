import { useState, useRef, useEffect } from "react";
import { Beer } from "lucide-react";

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackIcon?: React.ReactNode;
  loading?: "lazy" | "eager";
  objectFit?: "cover" | "contain";
}

export const OptimizedImage = ({
  src,
  alt,
  className = "",
  containerClassName = "",
  fallbackIcon,
  loading = "lazy",
  objectFit = "cover",
}: OptimizedImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer para detectar cuando la imagen está en el viewport
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Una vez que está en vista, desconectar el observer
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px', // Cargar un poco antes de que sea visible
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src]);

  if (!src || imageError) {
    return (
      <div className={`img-placeholder flex items-center justify-center ${containerClassName}`}>
        {fallbackIcon || <Beer className="text-primary/30" size={64} />}
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={`relative flex items-center justify-center ${containerClassName}`}
    >
      {/* Placeholder que siempre está visible hasta que la imagen se carga */}
      <div className={`absolute inset-0 img-placeholder flex items-center justify-center transition-opacity duration-500 ${
        imageLoaded ? 'opacity-0' : 'opacity-100'
      }`}>
        <Beer className="text-primary/20" size={48} />
      </div>
      
      {/* Imagen que solo se muestra cuando está en vista y cargada */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${objectFit === "cover" ? "object-cover" : "object-contain"} ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } transition-opacity duration-500 max-w-full max-h-full`}
          loading={loading}
          onLoad={() => {
            // Pequeño delay para evitar parpadeos durante scroll rápido
            setTimeout(() => setImageLoaded(true), 100);
          }}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
      )}
    </div>
  );
};

