import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/Rating";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useAllReviews, useDeleteReview } from "@/hooks/useReviews";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export const ReviewsManagement = () => {
  const { data: allReviews = [], isLoading: reviewsLoading } = useAllReviews();
  const deleteReview = useDeleteReview();

  const handleDelete = async (reviewId: string, beerId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta reseña?")) {
      return;
    }
    
    try {
      await deleteReview.mutateAsync({ reviewId, beerId });
      toast.success("Reseña eliminada exitosamente");
    } catch (error) {
      toast.error("Error al eliminar la reseña");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold">Gestión de Reseñas</h3>
          <p className="text-sm text-muted-foreground">
            Todas las reseñas se publican automáticamente
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {allReviews.length} Reseñas
          </Badge>
        </div>
      </div>

      {reviewsLoading ? (
        <div className="text-center py-8">
          <Loader2 className="animate-spin mx-auto text-primary mb-2" size={32} />
          <p className="text-muted-foreground">Cargando reseñas...</p>
        </div>
      ) : allReviews.length === 0 ? (
        <Card className="p-8 text-center bg-gradient-to-br from-muted/30 to-muted/10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <MessageSquare className="text-muted-foreground" size={28} />
          </div>
          <h3 className="text-lg font-semibold mb-2">No hay reseñas</h3>
          <p className="text-muted-foreground text-sm">
            Las reseñas aparecerán aquí cuando los usuarios las escriban
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allReviews.map((review: any) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={handleDelete}
              isPending={deleteReview.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente para renderizar cada tarjeta de reseña
interface ReviewCardProps {
  review: any;
  onDelete: (id: string, beerId: string) => void;
  isPending: boolean;
}

const ReviewCard = ({ review, onDelete, isPending }: ReviewCardProps) => {
  return (
    <Card className="p-5 bg-gradient-to-br from-card to-card/95 hover:shadow-lg transition-all duration-200">
      <div className="flex gap-4">
        {/* Imagen de la cerveza */}
        {review.beers?.image && (
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
            <OptimizedImage
              src={review.beers.image}
              alt={review.beers?.name || "Cerveza"}
              containerClassName="w-full h-full"
              className="object-contain"
              loading="lazy"
            />
          </div>
        )}

        {/* Contenido de la reseña */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-semibold text-lg text-foreground mb-1">
                {review.beers?.name || "Cerveza desconocida"}
              </h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{review.user_name}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(review.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
            </div>
            <Rating rating={review.rating} size={16} />
          </div>

          {/* Comentario */}
          <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg">
            {review.comment}
          </p>

          {/* Botón de eliminar */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(review.id, review.beer_id)}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={14} />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2" size={14} />
                  Eliminar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};