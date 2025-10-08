import { useState } from "react";
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

  if (!src || imageError) {
    return (
      <div className={`img-placeholder ${containerClassName}`}>
        {fallbackIcon || <Beer className="text-primary/30" size={64} />}
      </div>
    );
  }

  return (
    <div className={`relative ${containerClassName}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 img-placeholder animate-pulse">
          <Beer className="text-primary/20 animate-pulse" size={48} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${objectFit === "cover" ? "object-cover" : "object-contain"} ${
          imageLoaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
        loading={loading}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(false);
        }}
      />
    </div>
  );
};

