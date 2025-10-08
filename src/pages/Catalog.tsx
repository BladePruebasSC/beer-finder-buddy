import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BeerCard } from "@/components/BeerCard";
import { getBeersList, type Beer } from "@/lib/beerStorage";
import { Beer as BeerIcon, ArrowLeft, X } from "lucide-react";

const Catalog = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [beers, setBeers] = useState<Beer[]>([]);
  
  const selectedFilters = location.state?.filters || {
    style: [],
    color: [],
    flavor: [],
    strength: [],
    bitterness: [],
  };

  useEffect(() => {
    setBeers(getBeersList());
  }, []);

  const filteredBeers = useMemo(() => {
    return beers.filter((beer: Beer) => {
      if (selectedFilters.style.length > 0 && !selectedFilters.style.includes(beer.style)) {
        return false;
      }

      if (selectedFilters.color.length > 0 && !selectedFilters.color.includes(beer.color)) {
        return false;
      }

      if (selectedFilters.flavor.length > 0) {
        const hasMatchingFlavor = beer.flavor.some((flavor) =>
          selectedFilters.flavor.includes(flavor)
        );
        if (!hasMatchingFlavor) return false;
      }

      if (selectedFilters.strength.length > 0) {
        const strengthMatch = selectedFilters.strength.some((strength) => {
          if (strength === "light") return beer.abv < 5;
          if (strength === "medium") return beer.abv >= 5 && beer.abv <= 6.5;
          if (strength === "strong") return beer.abv > 6.5;
          return false;
        });
        if (!strengthMatch) return false;
      }

      if (selectedFilters.bitterness.length > 0) {
        const bitternessMatch = selectedFilters.bitterness.some((bitterness) => {
          if (bitterness === "low") return beer.ibu < 30;
          if (bitterness === "medium") return beer.ibu >= 30 && beer.ibu <= 50;
          if (bitterness === "high") return beer.ibu > 50;
          return false;
        });
        if (!bitternessMatch) return false;
      }

      return true;
    });
  }, [beers, selectedFilters]);

  const hasActiveFilters = Object.values(selectedFilters).some((filters: any) => filters.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Catálogo de Cervezas</h1>
            <p className="text-muted-foreground mt-1">
              {filteredBeers.length} cerveza{filteredBeers.length !== 1 ? "s" : ""} encontrada{filteredBeers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {filteredBeers.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <BeerIcon className="text-muted-foreground" size={40} />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              No se encontraron cervezas
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {hasActiveFilters 
                ? "Intenta ajustar tus filtros para ver más resultados"
                : "No hay cervezas disponibles en el catálogo"}
            </p>
            <Button onClick={() => navigate("/")}>
              Volver a filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBeers.map((beer) => (
              <BeerCard key={beer.id} beer={beer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
