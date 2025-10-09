import { Card } from "@/components/ui/card";
import { Rating } from "@/components/Rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useReviews } from "@/hooks/useReviews";
import { Loader2, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ReviewsListProps {
  beerId: string;
}

export const ReviewsList = ({ beerId }: ReviewsListProps) => {
  const { data: reviews = [], isLoading } = useReviews(beerId);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="animate-spin mx-auto text-primary mb-2" size={32} />
        <p className="text-muted-foreground">Cargando reseñas...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
          <MessageSquare className="text-muted-foreground" size={28} />
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay reseñas aún</h3>
        <p className="text-muted-foreground text-sm">
          ¡Sé el primero en compartir tu opinión sobre esta cerveza!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">
        Reseñas ({reviews.length})
      </h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card
            key={review.id}
            className="p-5 bg-gradient-to-br from-card to-card/95 hover:shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar className="h-10 w-10 bg-gradient-to-br from-primary to-accent">
                <AvatarFallback className="bg-transparent text-white font-bold">
                  {review.user_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Contenido de la reseña */}
              <div className="flex-1 space-y-2">
                {/* Header con nombre y fecha */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {review.user_name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                  <Rating rating={review.rating} size={16} />
                </div>

                {/* Comentario */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {review.comment}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

