import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/Rating";
import { OptimizedImage } from "@/components/OptimizedImage";
import { usePendingReviews, useApproveReview, useDeleteReview } from "@/hooks/useReviews";
import { Loader2, Check, X, MessageSquare, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export const ReviewsManagement = () => {
  const { data: pendingReviews = [], isLoading } = usePendingReviews();
  const approveReview = useApproveReview();
  const deleteReview = useDeleteReview();

  const handleApprove = async (reviewId: string) => {
    try {
      await approveReview.mutateAsync(reviewId);
      toast.success("Reseña aprobada exitosamente");
    } catch (error) {
      toast.error("Error al aprobar la reseña");
    }
  };

  const handleDelete = async (reviewId: string, beerId: string) => {
    try {
      await deleteReview.mutateAsync({ reviewId, beerId });
      toast.success("Reseña eliminada exitosamente");
    } catch (error) {
      toast.error("Error al eliminar la reseña");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="animate-spin mx-auto text-primary mb-2" size={32} />
        <p className="text-muted-foreground">Cargando reseñas pendientes...</p>
      </div>
    );
  }

  if (pendingReviews.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
          <MessageSquare className="text-muted-foreground" size={28} />
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay reseñas pendientes</h3>
        <p className="text-muted-foreground text-sm">
          ¡Todas las reseñas han sido procesadas!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold">Reseñas Pendientes</h3>
          <p className="text-sm text-muted-foreground">
            {pendingReviews.length} reseña{pendingReviews.length !== 1 ? "s" : ""} esperando aprobación
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Clock size={14} />
          Pendientes: {pendingReviews.length}
        </Badge>
      </div>

      <div className="grid gap-4">
        {pendingReviews.map((review: any) => (
          <Card
            key={review.id}
            className="p-5 bg-gradient-to-br from-card to-card/95 hover:shadow-lg transition-all duration-200"
          >
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

                {/* Botones de acción */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(review.id)}
                    disabled={approveReview.isPending || deleteReview.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {approveReview.isPending ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={14} />
                        Aprobando...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2" size={14} />
                        Aprobar
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(review.id, review.beer_id)}
                    disabled={approveReview.isPending || deleteReview.isPending}
                  >
                    {deleteReview.isPending ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={14} />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <X className="mr-2" size={14} />
                        Eliminar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

