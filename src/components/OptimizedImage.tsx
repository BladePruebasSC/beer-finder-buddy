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
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer optimizado para móviles - carga muy anticipada
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
        threshold: 0, // Detectar inmediatamente
        rootMargin: '400px', // Cargar MUCHO antes (400px arriba y abajo)
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
          ref={imgRef}
          src={src}
          alt={alt}
          className={`${className} ${objectFit === "cover" ? "object-cover" : "object-contain"} max-w-full max-h-full ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          // Desactivar lazy loading nativo una vez que nuestra lógica decide cargar
          loading="auto"
          fetchPriority="auto"
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
            // Transición más rápida y solo durante carga
            transition: imageLoaded ? 'none' : 'opacity 0.15s ease-out',
            // Mantener en memoria la imagen y forzar GPU
            transform: 'translate3d(0, 0, 0)',
            WebkitTransform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            // Optimizar rendering
            imageRendering: 'auto',
          }}
        />
      )}
    </div>
  );
};

