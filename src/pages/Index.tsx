import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FilterSection } from "@/components/FilterSection";
import { BeerCard } from "@/components/BeerCard";
import { beersDatabase, type Beer } from "@/data/beers";
import { filterCategories } from "@/data/filters";
import { Beer as BeerIcon, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import heroImage from "@/assets/hero-beer.jpg";

const Index = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<{
    style: string[];
    color: string[];
    flavor: string[];
    strength: string[];
    bitterness: string[];
  }>({
    style: [],
    color: [],
    flavor: [],
    strength: [],
    bitterness: [],
  });

  const handleFilterToggle = (category: keyof typeof selectedFilters, filterId: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(filterId)
        ? prev[category].filter((id) => id !== filterId)
        : [...prev[category], filterId],
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      style: [],
      color: [],
      flavor: [],
      strength: [],
      bitterness: [],
    });
  };

  const hasActiveFilters = Object.values(selectedFilters).some((filters) => filters.length > 0);

  const filteredBeers = useMemo(() => {
    return beersDatabase.filter((beer: Beer) => {
      // Style filter
      if (selectedFilters.style.length > 0 && !selectedFilters.style.includes(beer.style)) {
        return false;
      }

      // Color filter
      if (selectedFilters.color.length > 0 && !selectedFilters.color.includes(beer.color)) {
        return false;
      }

      // Flavor filter
      if (selectedFilters.flavor.length > 0) {
        const hasMatchingFlavor = beer.flavor.some((flavor) =>
          selectedFilters.flavor.includes(flavor)
        );
        if (!hasMatchingFlavor) return false;
      }

      // Strength filter
      if (selectedFilters.strength.length > 0) {
        const strengthMatch = selectedFilters.strength.some((strength) => {
          if (strength === "light") return beer.abv < 5;
          if (strength === "medium") return beer.abv >= 5 && beer.abv <= 6.5;
          if (strength === "strong") return beer.abv > 6.5;
          return false;
        });
        if (!strengthMatch) return false;
      }

      // Bitterness filter
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
  }, [selectedFilters]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-beer)] mb-6">
              <BeerIcon className="text-primary-foreground" size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Encuentra Tu Cerveza Perfecta
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Descubre la cerveza ideal según tus gustos. Filtra por sabor, color, estilo y más para encontrar tu próxima favorita.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[var(--shadow-beer)] hover:shadow-xl transition-[var(--transition-smooth)] text-lg px-8"
              onClick={() => setShowFilters(true)}
            >
              <Search className="mr-2" size={20} />
              Explorar Cervezas
            </Button>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      {showFilters && (
        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Filtros</h2>
              <p className="text-muted-foreground">
                {filteredBeers.length} cerveza{filteredBeers.length !== 1 ? "s" : ""} encontrada
                {filteredBeers.length !== 1 ? "s" : ""}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex items-center gap-2"
              >
                <X size={16} />
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <FilterSection
              title={filterCategories.style.title}
              options={filterCategories.style.options}
              selectedFilters={selectedFilters.style}
              onFilterToggle={(filterId) => handleFilterToggle("style", filterId)}
            />
            <FilterSection
              title={filterCategories.color.title}
              options={filterCategories.color.options}
              selectedFilters={selectedFilters.color}
              onFilterToggle={(filterId) => handleFilterToggle("color", filterId)}
            />
            <FilterSection
              title={filterCategories.flavor.title}
              options={filterCategories.flavor.options}
              selectedFilters={selectedFilters.flavor}
              onFilterToggle={(filterId) => handleFilterToggle("flavor", filterId)}
            />
            <FilterSection
              title={filterCategories.strength.title}
              options={filterCategories.strength.options}
              selectedFilters={selectedFilters.strength}
              onFilterToggle={(filterId) => handleFilterToggle("strength", filterId)}
            />
            <FilterSection
              title={filterCategories.bitterness.title}
              options={filterCategories.bitterness.options}
              selectedFilters={selectedFilters.bitterness}
              onFilterToggle={(filterId) => handleFilterToggle("bitterness", filterId)}
            />
          </div>
        </section>
      )}

      {/* Results Section */}
      {showFilters && (
        <section className="container mx-auto px-4 pb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">Resultados</h2>
          {filteredBeers.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <BeerIcon className="text-muted-foreground" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No se encontraron cervezas
              </h3>
              <p className="text-muted-foreground mb-6">
                Intenta ajustar tus filtros para ver más resultados
              </p>
              <Button variant="outline" onClick={clearAllFilters}>
                Limpiar todos los filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredBeers.map((beer) => (
                <BeerCard key={beer.id} beer={beer} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="bg-secondary/10 border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <BeerIcon size={20} className="text-primary" />
            <span>Descubre tu cerveza perfecta</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
