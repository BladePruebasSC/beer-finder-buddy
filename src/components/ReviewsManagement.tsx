import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rating } from "@/components/Rating";
import { OptimizedImage } from "@/components/OptimizedImage";
import { usePendingReviews, useApprovedReviews, useApproveReview, useDeleteReview } from "@/hooks/useReviews";
import { Loader2, Check, MessageSquare, Clock, CheckCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export const ReviewsManagement = () => {
  const { data: pendingReviews = [], isLoading: pendingLoading } = usePendingReviews();
  const { data: approvedReviews = [], isLoading: approvedLoading } = useApprovedReviews();
  const approveReview = useApproveReview();
  const deleteReview = useDeleteReview();
  const [activeTab, setActiveTab] = useState("pending");

  const handleApprove = async (reviewId: string) => {
    try {
      await approveReview.mutateAsync(reviewId);
      toast.success("Reseña aprobada exitosamente");
    } catch (error) {
      toast.error("Error al aprobar la reseña");
    }
  };

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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold">Gestión de Reseñas</h3>
          <p className="text-sm text-muted-foreground">
            Administra las reseñas pendientes y aprobadas
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Clock size={14} />
            Pendientes: {pendingReviews.length}
          </Badge>
          <Badge variant="default" className="flex items-center gap-2">
            <CheckCircle size={14} />
            Aprobadas: {approvedReviews.length}
          </Badge>
        </div>
      </div>

      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Clock size={16} />
          Pendientes {pendingReviews.length > 0 && `(${pendingReviews.length})`}
        </TabsTrigger>
        <TabsTrigger value="approved" className="flex items-center gap-2">
          <CheckCircle size={16} />
          Aprobadas {approvedReviews.length > 0 && `(${approvedReviews.length})`}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="space-y-4">
        {pendingLoading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto text-primary mb-2" size={32} />
            <p className="text-muted-foreground">Cargando reseñas pendientes...</p>
          </div>
        ) : pendingReviews.length === 0 ? (
          <Card className="p-8 text-center bg-gradient-to-br from-muted/30 to-muted/10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
              <MessageSquare className="text-muted-foreground" size={28} />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay reseñas pendientes</h3>
            <p className="text-muted-foreground text-sm">
              ¡Todas las reseñas han sido procesadas!
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingReviews.map((review: any) => (
              <ReviewCard
                key={review.id}
                review={review}
                onApprove={handleApprove}
                onDelete={handleDelete}
                showApprove={true}
                isPending={approveReview.isPending || deleteReview.isPending}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="approved" className="space-y-4">
        {approvedLoading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto text-primary mb-2" size={32} />
            <p className="text-muted-foreground">Cargando reseñas aprobadas...</p>
          </div>
        ) : approvedReviews.length === 0 ? (
          <Card className="p-8 text-center bg-gradient-to-br from-muted/30 to-muted/10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
              <CheckCircle className="text-muted-foreground" size={28} />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay reseñas aprobadas</h3>
            <p className="text-muted-foreground text-sm">
              Las reseñas aprobadas aparecerán aquí
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {approvedReviews.map((review: any) => (
              <ReviewCard
                key={review.id}
                review={review}
                onApprove={handleApprove}
                onDelete={handleDelete}
                showApprove={false}
                isPending={deleteReview.isPending}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

// Componente para renderizar cada tarjeta de reseña
interface ReviewCardProps {
  review: any;
  onApprove: (id: string) => void;
  onDelete: (id: string, beerId: string) => void;
  showApprove: boolean;
  isPending: boolean;
}

const ReviewCard = ({ review, onApprove, onDelete, showApprove, isPending }: ReviewCardProps) => {
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

          {/* Botones de acción */}
          <div className="flex items-center gap-2 pt-2">
            {showApprove && (
              <Button
                size="sm"
                onClick={() => onApprove(review.id)}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="mr-2" size={14} />
                Aprobar
              </Button>
            )}
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
