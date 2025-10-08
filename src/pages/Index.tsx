import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getFilters } from "@/lib/filterStorage";
import { Beer as BeerIcon, Search, Sparkles, X, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-beer.jpg";
import { BeerAILoader } from "@/components/BeerAILoader";

const Index = () => {
  const navigate = useNavigate();
  const [secretCode, setSecretCode] = useState("");
  const [filters] = useState(getFilters());
  const [activeCategory, setActiveCategory] = useState<string>("style");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [showAiMessage, setShowAiMessage] = useState(false);
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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const char = e.key.toUpperCase();
      if (/^[A-Z]$/.test(char)) {
        setSecretCode((prev) => {
          const newCode = (prev + char).slice(-5);
          if (newCode === "CDERF") {
            sessionStorage.setItem("dashboard_auth", "true");
            navigate("/dashboard");
            return "";
          }
          return newCode;
        });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate]);

  const aiMessages = [
    "¡Hola! Soy tu sommelier de cervezas con IA 🍺",
    "Cuéntame, ¿qué tipo de cerveza te apetece hoy?",
    "Selecciona tus preferencias y encontraré la cerveza perfecta para ti ✨",
    "¿Prefieres algo ligero o más intenso?",
    "¡Tengo miles de cervezas en mi base de datos!",
  ];

  useEffect(() => {
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      if (showContent) {
        setAiMessage(aiMessages[messageIndex]);
        setShowAiMessage(true);
        setTimeout(() => setShowAiMessage(false), 4000);
        messageIndex = (messageIndex + 1) % aiMessages.length;
      }
    }, 8000);

    if (showContent) {
      setAiMessage(aiMessages[0]);
      setShowAiMessage(true);
      setTimeout(() => setShowAiMessage(false), 4000);
    }

    return () => clearInterval(messageInterval);
  }, [showContent]);

  const handleFilterToggle = (category: keyof typeof selectedFilters, filterId: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(filterId)
        ? prev[category].filter((id) => id !== filterId)
        : [...prev[category], filterId],
    }));

    const encouragingMessages = [
      "¡Excelente elección! Me gusta tu estilo 👌",
      "Interesante... estoy aprendiendo de tus gustos 🧠",
      "¡Perfecto! Estoy refinando las recomendaciones ✨",
      "Mmm, veo que tienes buen gusto 🍺",
      "¡Me encanta! Sigue explorando 🎯",
    ];

    const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    setAiMessage(randomMessage);
    setShowAiMessage(true);
    setTimeout(() => setShowAiMessage(false), 2500);
  };

  const handleSearch = () => {
    setIsSearching(true);
  };

  const categories = [
    { id: "style", label: "Estilo", icon: "🍺" },
    { id: "color", label: "Color", icon: "🎨" },
    { id: "flavor", label: "Sabor", icon: "👅" },
    { id: "strength", label: "Fuerza", icon: "💪" },
    { id: "bitterness", label: "Amargor", icon: "😤" },
  ];

  const getFilterData = (categoryId: string) => {
    return filters[categoryId as keyof typeof filters];
  };

  const getTotalSelectedCount = () => {
    return Object.values(selectedFilters).reduce((acc, arr) => acc + arr.length, 0);
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

  if (isLoading) {
    return <BeerAILoader type="initial" onComplete={() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 100);
    }} />;
  }

  if (isSearching) {
    return <BeerAILoader type="search" onComplete={() => {
      navigate("/catalog", { state: { filters: selectedFilters } });
    }} />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-background via-background to-muted transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${
          showAiMessage ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 max-w-md">
          <MessageCircle className="animate-bounce" size={20} />
          <p className="font-medium">{aiMessage}</p>
        </div>
      </div>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={heroImage} 
            alt="Cervezas artesanales"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg mb-6 animate-pulse">
              <BeerIcon className="text-primary-foreground" size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Beer AI Assistant
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-2 max-w-2xl mx-auto">
              Tu sommelier inteligente de cervezas
            </p>
            <p className="text-sm text-muted-foreground/80 mb-6 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Powered by AI
            </p>
            {getTotalSelectedCount() > 0 && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {getTotalSelectedCount()} preferencias seleccionadas
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-9"
                >
                  <X className="mr-1 h-4 w-4" />
                  Limpiar
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12 max-w-6xl">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat) => {
            const count = selectedFilters[cat.id as keyof typeof selectedFilters].length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg scale-105"
                    : "bg-card hover:bg-muted border border-border"
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
                {count > 0 && (
                  <Badge
                    variant="secondary"
                    className={`ml-2 ${activeCategory === cat.id ? 'bg-white/20' : ''}`}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8 min-h-[300px]">
          {getFilterData(activeCategory).options.map((option) => {
            const isSelected = selectedFilters[activeCategory as keyof typeof selectedFilters].includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleFilterToggle(activeCategory as keyof typeof selectedFilters, option.id)}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  isSelected
                    ? "border-primary bg-gradient-to-br from-primary/10 to-accent/10 shadow-lg"
                    : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="text-center">
                  {option.icon && (
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {option.icon}
                    </div>
                  )}
                  <div className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {option.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center sticky bottom-6 z-10">
          <Button
            size="lg"
            onClick={handleSearch}
            disabled={getTotalSelectedCount() === 0}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg px-12 py-6 rounded-full hover:scale-105"
          >
            <Search className="mr-2" size={22} />
            Buscar Cervezas
            {getTotalSelectedCount() > 0 && (
              <Badge variant="secondary" className="ml-3 bg-white/20">
                {getTotalSelectedCount()}
              </Badge>
            )}
          </Button>
        </div>
      </section>

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
