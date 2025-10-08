import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBeerById, type Beer } from "@/lib/beerStorage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Flame, Droplet, MapPin, Building2 } from "lucide-react";

const BeerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beer, setBeer] = useState<Beer | null>(null);

  useEffect(() => {
    if (id) {
      const foundBeer = getBeerById(id);
      setBeer(foundBeer);
    }
  }, [id]);

  if (!beer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Cerveza no encontrada</h2>
          <Button onClick={() => navigate("/catalog")}>Volver al catálogo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="outline"
          onClick={() => navigate("/catalog")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2" size={16} />
          Volver al catálogo
        </Button>

        <Card className="overflow-hidden">
          {beer.image && (
            <div className="w-full h-64 md:h-96 bg-muted flex items-center justify-center overflow-hidden">
              <img 
                src={beer.image} 
                alt={beer.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {beer.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 size={18} />
                <span className="text-lg">{beer.brewery}</span>
              </div>
              {beer.origin && (
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <MapPin size={18} />
                  <span>{beer.origin}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 text-center bg-muted/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="text-primary" size={20} />
                  <span className="font-semibold">{beer.abv}%</span>
                </div>
                <p className="text-xs text-muted-foreground">ABV</p>
              </Card>
              
              <Card className="p-4 text-center bg-muted/50">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Droplet className="text-primary" size={20} />
                  <span className="font-semibold">{beer.ibu}</span>
                </div>
                <p className="text-xs text-muted-foreground">IBU</p>
              </Card>

              <Card className="p-4 text-center bg-muted/50">
                <div className="mb-1">
                  <span className="font-semibold">{beer.style}</span>
                </div>
                <p className="text-xs text-muted-foreground">Estilo</p>
              </Card>

              <Card className="p-4 text-center bg-muted/50">
                <div className="mb-1">
                  <span className="font-semibold">{beer.color}</span>
                </div>
                <p className="text-xs text-muted-foreground">Color</p>
              </Card>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed">
                {beer.description}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Sabores</h3>
              <div className="flex flex-wrap gap-2">
                {beer.flavor.map((flavor, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="px-3 py-1"
                  >
                    {flavor}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BeerDetail;
