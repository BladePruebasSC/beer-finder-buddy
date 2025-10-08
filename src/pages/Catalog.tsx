import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BeerCard } from "@/components/BeerCard";
import { AIChat } from "@/components/AIChat";
import { BeerAILoader } from "@/components/BeerAILoader";
import { useBeers } from "@/hooks/useBeers";
import { Beer as BeerIcon, ArrowLeft, Loader2, Sparkles, MessageCircle } from "lucide-react";

const Catalog = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: beers = [], isLoading } = useBeers();
  const [showContent, setShowContent] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [showAiMessage, setShowAiMessage] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSearchLoader, setShowSearchLoader] = useState(false);
  const [searchFilters, setSearchFilters] = useState<any>(null);
  const [swipeY, setSwipeY] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const defaultFilters = {
    style: [],
    color: [],
    flavor: [],
    strength: [],
    bitterness: [],
    origin: [],
  };

  const selectedFilters = {
    ...defaultFilters,
    ...(location.state?.filters || {}),
  };

  // Asegurar que todas las propiedades sean arrays
  Object.keys(selectedFilters).forEach(key => {
    if (!Array.isArray(selectedFilters[key])) {
      selectedFilters[key] = [];
    }
  });

  // Debug: verificar que los filtros estén correctos
  console.log('[Catalog] selectedFilters:', selectedFilters);

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

      if (selectedFilters.origin.length > 0 && beer.origin && !selectedFilters.origin.includes(beer.origin)) {
        return false;
      }

      return true;
    });
  }, [beers, selectedFilters]);

  const hasActiveFilters = Object.values(selectedFilters).some((filters: any) => filters.length > 0);

  // Si está mostrando el loader de búsqueda, solo mostrar eso
  if (showSearchLoader) {
    return (
      <BeerAILoader
        type="search"
        onComplete={() => {
          navigate("/catalog", { state: { filters: searchFilters } });
        }}
      />
    );
  }

  useEffect(() => {
    setShowContent(true);

    if (filteredBeers.length > 0) {
      let messages;
      
      if (!hasActiveFilters) {
        // Mensajes para catálogo completo
        messages = [
          `¡Este es el catálogo completo! ${filteredBeers.length} cervezas disponibles 🍺`,
          `Explora nuestra colección completa de ${filteredBeers.length} cervezas artesanales 🌟`,
          `Descubre las ${filteredBeers.length} cervezas de nuestro catálogo completo ✨`,
        ];
      } else {
        // Mensajes para búsqueda filtrada
        messages = [
          `¡Increíble! Encontré ${filteredBeers.length} cervezas perfectas para ti 🎯`,
          `He analizado más de 1000 opciones y seleccioné las mejores ${filteredBeers.length} 🧠`,
          `Mis algoritmos de IA encontraron ${filteredBeers.length} matches perfectos ✨`,
        ];
      }

       const randomMessage = messages[Math.floor(Math.random() * messages.length)];
       setAiMessage(randomMessage);
       setShowAiMessage(true);
       setTimeout(() => setShowAiMessage(false), 6000);
    }
  }, [filteredBeers.length, hasActiveFilters]);

  // Funciones para manejar el swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setSwipeY(touch.clientY);
    setIsSwipeActive(true);
    e.stopPropagation(); // Evitar que afecte otros elementos
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeActive) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - swipeY;
    
    // Solo permitir swipe hacia arriba (valores negativos)
    if (deltaY < 0) {
      e.preventDefault(); // Evitar scroll de la página
      e.stopPropagation(); // Evitar que se propague a otros elementos
      const notification = notificationRef.current;
      if (notification) {
        notification.style.transform = `translateY(${deltaY}px)`;
        notification.style.opacity = `${Math.max(0.1, 1 + deltaY / 80)}`;
        notification.style.transition = 'none'; // Desactivar transición durante el swipe
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwipeActive) return;
    
    const touch = e.changedTouches[0];
    const deltaY = touch.clientY - swipeY;
    
    const notification = notificationRef.current;
    
    // Si el swipe es suficiente hacia arriba, ocultar la notificación
    if (deltaY < -60) {
      setShowAiMessage(false);
    } else {
      // Resetear la posición con animación suave
      if (notification) {
        notification.style.transition = 'all 0.3s ease-out';
        notification.style.transform = '';
        notification.style.opacity = '';
      }
    }
    
    e.stopPropagation(); // Evitar que se propague a otros elementos
    setIsSwipeActive(false);
    setSwipeY(0);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-background to-muted transition-opacity duration-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      <div
        ref={notificationRef}
        className={`fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-40 transition-all duration-500 ${
          showAiMessage ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
         <button
           onClick={() => setIsChatOpen(true)}
           className="bg-gradient-to-r from-primary to-accent text-white px-6 sm:px-10 py-4 rounded-3xl shadow-2xl flex items-center gap-4 w-full max-w-none sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer"
         >
           <MessageCircle className="animate-bounce flex-shrink-0" size={22} />
           <p className="font-medium text-sm sm:text-base md:text-lg leading-relaxed text-left">{aiMessage}</p>
         </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
            title="Volver al inicio"
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
              Volver al inicio
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

      {/* AI Chat Modal */}
      <AIChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSearch={(filters) => {
          console.log('📥 Filtros recibidos en Catalog:', filters); // Debug
          setSearchFilters(filters);
        }}
        onStartSearch={() => {
          setIsChatOpen(false);
          setShowSearchLoader(true);
        }}
      />

    </div>
  );
};

export default Catalog;
