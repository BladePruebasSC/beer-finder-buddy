import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/Rating";
import { useCreateReview } from "@/hooks/useReviews";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface ReviewFormProps {
  beerId: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ beerId, onSuccess }: ReviewFormProps) => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  
  const createReview = useCreateReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !comment.trim() || rating === 0) {
      toast.error("Por favor completa todos los campos y selecciona una calificación");
      return;
    }

    try {
      await createReview.mutateAsync({
        beer_id: beerId,
        user_name: name.trim(),
        rating,
        comment: comment.trim(),
        approved: false,
      });

      // Limpiar formulario
      setName("");
      setRating(0);
      setComment("");

      toast.success("¡Reseña enviada! Será visible una vez aprobada por un moderador 🎉");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error al crear reseña:", error);
      toast.error("Hubo un error al publicar tu reseña. Por favor intenta de nuevo.");
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/95">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Déjanos tu opinión
          </h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={createReview.isPending}
            className="transition-all duration-200 focus:scale-[1.01]"
          />
        </div>

        <div className="space-y-2">
          <Label>Calificación *</Label>
          <div className="flex items-center gap-2">
            <Rating
              rating={rating}
              interactive
              onRatingChange={setRating}
              size={32}
            />
            {rating > 0 && (
              <span className="text-sm font-medium text-muted-foreground">
                {rating} {rating === 1 ? "estrella" : "estrellas"}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment">Comentario *</Label>
          <Textarea
            id="comment"
            placeholder="Cuéntanos sobre tu experiencia con esta cerveza..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={createReview.isPending}
            rows={4}
            className="resize-none transition-all duration-200 focus:scale-[1.01]"
          />
        </div>

        <Button
          type="submit"
          disabled={createReview.isPending}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-200 hover:scale-[1.02]"
        >
          {createReview.isPending ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={18} />
              Publicando...
            </>
          ) : (
            <>
              <Send className="mr-2" size={18} />
              Publicar reseña
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

