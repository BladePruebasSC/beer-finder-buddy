import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplet, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OptimizedImage } from "./OptimizedImage";
import { Rating } from "./Rating";
import { useAllBeerRatings } from "@/hooks/useReviews";

interface BeerCardProps {
  beer: {
    id: string;
    name: string;
    brewery: string;
    style: string;
    abv: number;
    ibu: number;
    color: string;
    flavor: string[];
    description: string;
    image?: string | null;
  };
}

export const BeerCard = ({ beer }: BeerCardProps) => {
  const navigate = useNavigate();
  const { data: allRatings } = useAllBeerRatings();
  const beerRating = allRatings?.[beer.id];
  
  return (
    <Card 
      className="overflow-hidden bg-card border-border shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-beer)] transition-[var(--transition-smooth)] cursor-pointer group hover:-translate-y-1"
      onClick={() => navigate(`/beer/${beer.id}`)}
    >
      <OptimizedImage
        src={beer.image}
        alt={beer.name}
        containerClassName="beer-image-container h-48 sm:h-56 img-container-gradient"
        className="beer-image beer-image-transition group-hover:scale-105"
        loading="lazy"
        objectFit="contain"
      />
      
      <div className="p-5">
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-[var(--transition-smooth)] line-clamp-1 flex-1">
              {beer.name}
            </h3>
            {beerRating && beerRating.total_reviews > 0 && (
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <Rating rating={beerRating.average_rating} size={14} />
                <span className="text-[10px] text-muted-foreground">
                  {beerRating.total_reviews}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{beer.brewery}</p>
        </div>

        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Flame size={16} className="text-accent" />
            <span className="font-medium">{beer.abv}% ABV</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Droplet size={16} className="text-secondary" />
            <span className="font-medium">{beer.ibu} IBU</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{beer.description}</p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {beer.style}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {beer.color}
          </Badge>
          {beer.flavor.slice(0, 2).map((flavor) => (
            <Badge key={flavor} variant="outline" className="text-xs">
              {flavor}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};
