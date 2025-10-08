import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CollapsibleFilterSection } from "@/components/CollapsibleFilterSection";
import { filterCategories } from "@/data/filters";
import { Beer as BeerIcon, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-beer.jpg";

const Index = () => {
  const navigate = useNavigate();
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

  const handleSearch = () => {
    navigate("/catalog", { state: { filters: selectedFilters } });
  };

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
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
          Selecciona tus preferencias
        </h2>
        
        <div className="space-y-3 mb-8">
          <CollapsibleFilterSection
            title={filterCategories.style.title}
            options={filterCategories.style.options}
            selectedFilters={selectedFilters.style}
            onFilterToggle={(filterId) => handleFilterToggle("style", filterId)}
          />
          <CollapsibleFilterSection
            title={filterCategories.color.title}
            options={filterCategories.color.options}
            selectedFilters={selectedFilters.color}
            onFilterToggle={(filterId) => handleFilterToggle("color", filterId)}
          />
          <CollapsibleFilterSection
            title={filterCategories.flavor.title}
            options={filterCategories.flavor.options}
            selectedFilters={selectedFilters.flavor}
            onFilterToggle={(filterId) => handleFilterToggle("flavor", filterId)}
          />
          <CollapsibleFilterSection
            title={filterCategories.strength.title}
            options={filterCategories.strength.options}
            selectedFilters={selectedFilters.strength}
            onFilterToggle={(filterId) => handleFilterToggle("strength", filterId)}
          />
          <CollapsibleFilterSection
            title={filterCategories.bitterness.title}
            options={filterCategories.bitterness.options}
            selectedFilters={selectedFilters.bitterness}
            onFilterToggle={(filterId) => handleFilterToggle("bitterness", filterId)}
          />
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSearch}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[var(--shadow-beer)] hover:shadow-xl transition-[var(--transition-smooth)] text-lg px-12"
          >
            <Search className="mr-2" size={20} />
            Buscar Cervezas
          </Button>
        </div>
      </section>

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
