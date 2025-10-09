import { Star } from "lucide-react";

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const Rating = ({ 
  rating, 
  maxRating = 5, 
  size = 20,
  interactive = false,
  onRatingChange 
}: RatingProps) => {
  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.floor(rating);
        const isHalfFilled = starValue === Math.ceil(rating) && rating % 1 !== 0;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            className={`relative ${
              interactive 
                ? "cursor-pointer hover:scale-110 transition-transform duration-200" 
                : "cursor-default"
            }`}
          >
            {/* Estrella de fondo (vacía) */}
            <Star 
              size={size} 
              className="text-muted-foreground/30"
              strokeWidth={1.5}
            />
            
            {/* Estrella rellenada */}
            {(isFilled || isHalfFilled) && (
              <div 
                className="absolute top-0 left-0 overflow-hidden"
                style={{ 
                  width: isHalfFilled ? '50%' : '100%' 
                }}
              >
                <Star 
                  size={size} 
                  className="text-yellow-500" 
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              </div>
            )}
          </button>
        );
      })}
      {!interactive && (
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

