import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BeerCard } from "@/components/BeerCard";
import { useBeers } from "@/hooks/useBeers";
import { Beer as BeerIcon, ArrowLeft, Loader2, Sparkles, MessageCircle } from "lucide-react";

const Catalog = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: beers = [], isLoading } = useBeers();
  const [showContent, setShowContent] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [showAiMessage, setShowAiMessage] = useState(false);
  
  const selectedFilters = location.state?.filters || {
    style: [],
    color: [],
    flavor: [],
    strength: [],
    bitterness: [],
  };

  const filteredBeers = useMemo(() => {
    return beers.filter((beer) => {
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

  useEffect(() => {
    setShowContent(true);

    if (filteredBeers.length > 0) {
      const messages = [
        `¡Increíble! Encontré ${filteredBeers.length} cervezas perfectas para ti 🎯`,
        `He analizado más de 1000 opciones y seleccioné las mejores ${filteredBeers.length} 🧠`,
        `Mis algoritmos de IA encontraron ${filteredBeers.length} matches perfectos ✨`,
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setAiMessage(randomMessage);
      setShowAiMessage(true);
      setTimeout(() => setShowAiMessage(false), 4000);
    }
  }, [filteredBeers.length]);

  return (
    <div className={`min-h-screen bg-gradient-to-b from-background to-muted transition-opacity duration-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${
          showAiMessage ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 max-w-2xl">
          <MessageCircle className="animate-bounce" size={20} />
          <p className="font-medium">{aiMessage}</p>
        </div>
      </div>

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
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Resultados AI</h1>
              <Badge variant="secondary" className="bg-gradient-to-r from-primary/20 to-accent/20">
                <Sparkles className="mr-1 h-3 w-3" />
                Beer AI
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {filteredBeers.length} cerveza{filteredBeers.length !== 1 ? "s" : ""} encontrada{filteredBeers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="animate-spin mx-auto text-primary mb-4" size={48} />
            <p className="text-muted-foreground">Cargando cervezas...</p>
          </div>
        ) : filteredBeers.length === 0 ? (
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
            {filteredBeers.map((beer, index) => (
              <div
                key={beer.id}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
              >
                <BeerCard beer={beer} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
