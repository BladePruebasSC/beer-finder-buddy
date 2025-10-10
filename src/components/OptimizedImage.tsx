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
  const [shouldLoad, setShouldLoad] = useState(loading === "eager");
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasLoadedRef = useRef(false); // Prevenir re-renders innecesarios

  // Intersection Observer optimizado para móviles
  useEffect(() => {
    // Si ya cargó una vez, nunca volver a observar
    if (!containerRef.current || loading === "eager" || hasLoadedRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // Una vez que entra en vista, cargar la imagen y marcar como cargada permanentemente
        if (entry.isIntersecting && !hasLoadedRef.current) {
          hasLoadedRef.current = true;
          setShouldLoad(true);
          // Desconectar inmediatamente para evitar re-renders
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
        }
      },
      {
        threshold: 0.01, // Detectar muy pronto
        rootMargin: '300px', // Cargar mucho antes de que sea visible
      }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []); // Solo ejecutar una vez al montar

  if (!src || imageError) {
    return (
      <div className={`img-placeholder flex items-center justify-center ${containerClassName}`}>
        {fallbackIcon || <Beer className="text-primary/30" size={64} />}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative flex items-center justify-center ${containerClassName}`}
      style={{ minHeight: '200px' }} // Reservar espacio para evitar layout shift
    >
      {/* Skeleton/Placeholder con transición suave */}
      {!imageLoaded && (
        <div className="absolute inset-0 img-placeholder flex items-center justify-center">
          <div className="animate-pulse">
            <Beer className="text-primary/20" size={48} />
          </div>
        </div>
      )}
      
      {/* Imagen - siempre renderizada una vez que shouldLoad es true, NUNCA se desmonta */}
      {(shouldLoad || hasLoadedRef.current) && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${objectFit === "cover" ? "object-cover" : "object-contain"} transition-opacity duration-300 max-w-full max-h-full ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading={loading}
          onLoad={() => {
            // Sin delay - marcar como cargada inmediatamente
            setImageLoaded(true);
          }}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
          // Optimizaciones adicionales para móviles
          decoding="async"
          style={{
            contentVisibility: 'auto',
            willChange: imageLoaded ? 'auto' : 'opacity',
            // Mantener en memoria la imagen
            contain: 'layout style paint',
          }}
        />
      )}
    </div>
  );
};

