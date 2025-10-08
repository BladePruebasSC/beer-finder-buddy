import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Beer, Droplet, Flame } from "lucide-react";

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
  };
}

export const BeerCard = ({ beer }: BeerCardProps) => {
  return (
    <Card className="p-5 bg-card border-border shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-beer)] transition-[var(--transition-smooth)] cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-[var(--transition-smooth)]">
            {beer.name}
          </h3>
          <p className="text-sm text-muted-foreground">{beer.brewery}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-beer)]">
          <Beer className="text-primary-foreground" size={24} />
        </div>
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
    </Card>
  );
};
