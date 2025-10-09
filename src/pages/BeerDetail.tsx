import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useBeer } from "@/hooks/useBeers";
import { useBeerRating } from "@/hooks/useReviews";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Rating } from "@/components/Rating";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList } from "@/components/ReviewsList";
import { ArrowLeft, Flame, Droplet, MapPin, Building2, Loader2, Bot, MessageCircle, X } from "lucide-react";

const BeerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: beer, isLoading } = useBeer(id);
  const { data: beerRating } = useBeerRating(id);
  const [showAiMessage, setShowAiMessage] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Mostrar mensaje de IA después de cargar
  useEffect(() => {
    if (beer && !isLoading) {
      const timer = setTimeout(() => {
        setShowAiMessage(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [beer, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-primary mb-4" size={48} />
          <p className="text-muted-foreground">Cargando cerveza...</p>
        </div>
      </div>
    );
  }

  if (!beer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Cerveza no encontrada</h2>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Mensaje de IA flotante - Compacto para móvil */}
      <div
        className={`fixed top-2 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 transition-all duration-500 ${
          showAiMessage ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <div className="bg-gradient-to-r from-primary to-accent text-white px-3 py-2 sm:px-6 sm:py-4 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center gap-2 sm:gap-4 w-full max-w-none sm:max-w-xl md:max-w-2xl mx-auto relative">
          <Bot className="animate-pulse flex-shrink-0" size={16} />
          <p className="font-medium text-sm sm:text-base md:text-lg leading-tight sm:leading-relaxed flex-1">
            <span className="hidden sm:inline">¿Te gustaría dejar una reseña sobre esta cerveza? 🍺 ¡Nos encantaría conocer tu opinión!</span>
            <span className="sm:hidden">¿Dejar una reseña? 🍺</span>
          </p>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setShowReviewForm(true);
                setShowAiMessage(false);
              }}
              className="hover:scale-105 transition-transform text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-6 sm:h-8"
            >
              <span className="hidden sm:inline">¡Claro!</span>
              <span className="sm:hidden">Sí</span>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowAiMessage(false)}
              className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-white/20"
            >
              <X size={12} className="sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2" size={16} />
          Volver al inicio
        </Button>

        <Card className="overflow-hidden">
          {beer.image && (
            <div className="w-full bg-gradient-to-b from-muted/50 to-background">
               <OptimizedImage
                 src={beer.image}
                 alt={beer.name}
                 containerClassName="w-full max-w-4xl mx-auto aspect-[3/4] md:aspect-[4/3] lg:aspect-[16/9] img-container-gradient"
                 className="beer-image beer-image-transition object-contain p-4 md:p-8 lg:p-12"
                 loading="eager"
                 objectFit="contain"
               />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {beer.name}
                </h1>
                {beerRating && beerRating.total_reviews > 0 && (
                  <div className="flex flex-col items-end gap-1">
                    <Rating rating={beerRating.average_rating} size={20} />
                    <span className="text-xs text-muted-foreground">
                      {beerRating.total_reviews} {beerRating.total_reviews === 1 ? "reseña" : "reseñas"}
                    </span>
                  </div>
                )}
              </div>
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

            <div className="mb-8">
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

            {/* Botón para mostrar formulario de reseña si está oculto */}
            {!showReviewForm && (
              <div className="mb-8">
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-200 hover:scale-[1.02]"
                >
                  <MessageCircle className="mr-2" size={18} />
                  Escribir una reseña
                </Button>
              </div>
            )}

            {/* Formulario de reseña */}
            {showReviewForm && (
              <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ReviewForm
                  beerId={beer.id}
                  onSuccess={() => setShowReviewForm(false)}
                />
              </div>
            )}

            {/* Lista de reseñas */}
            <div className="pt-6 border-t border-border">
              <ReviewsList beerId={beer.id} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BeerDetail;
