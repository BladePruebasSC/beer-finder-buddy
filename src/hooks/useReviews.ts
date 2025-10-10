import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Review, ReviewInsert } from "@/types/database";

export interface BeerRating {
  average_rating: number;
  total_reviews: number;
}

// Hook para obtener reseñas de una cerveza específica (solo aprobadas)
export const useReviews = (beerId: string | undefined) => {
  return useQuery({
    queryKey: ["reviews", beerId],
    queryFn: async () => {
      if (!beerId) return [];
      
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("beer_id", beerId)
        .eq("approved", true) // Solo mostrar reseñas aprobadas
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }

      return data as Review[];
    },
    enabled: !!beerId,
  });
};

// Hook para obtener estadísticas de calificación de una cerveza
export const useBeerRating = (beerId: string | undefined) => {
  return useQuery({
    queryKey: ["beer-rating", beerId],
    queryFn: async () => {
      if (!beerId) return null;
      
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("beer_id", beerId)
        .eq("approved", true);

      if (error) {
        console.error("Error fetching rating:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          average_rating: 0,
          total_reviews: 0,
        };
      }

      const totalReviews = data.length;
      const sumRatings = data.reduce((sum: number, review: any) => sum + review.rating, 0);
      const averageRating = sumRatings / totalReviews;

      return {
        average_rating: Number(averageRating.toFixed(1)),
        total_reviews: totalReviews,
      } as BeerRating;
    },
    enabled: !!beerId,
  });
};

// Hook para obtener todas las calificaciones de cervezas (para el catálogo)
export const useAllBeerRatings = () => {
  return useQuery({
    queryKey: ["all-beer-ratings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("beer_id, rating")
        .eq("approved", true); // Solo contar reseñas aprobadas

      if (error) {
        console.error("Error fetching all ratings:", error);
        throw error;
      }

      // Agrupar por beer_id y calcular promedios
      const ratingsMap = new Map<string, { sum: number; count: number }>();
      
      data?.forEach((review: any) => {
        const existing = ratingsMap.get(review.beer_id);
        if (existing) {
          existing.sum += review.rating;
          existing.count += 1;
        } else {
          ratingsMap.set(review.beer_id, { sum: review.rating, count: 1 });
        }
      });

      // Convertir a objeto con promedios
      const ratings: Record<string, BeerRating> = {};
      ratingsMap.forEach((value, beerId) => {
        ratings[beerId] = {
          average_rating: Number((value.sum / value.count).toFixed(1)),
          total_reviews: value.count,
        };
      });

      return ratings;
    },
  });
};

// Hook para obtener todas las reseñas pendientes (para el dashboard)
export const usePendingReviews = () => {
  return useQuery({
    queryKey: ["pending-reviews"],
    queryFn: async () => {
      // Temporalmente deshabilitar RLS para obtener todas las reseñas
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          beers:beer_id (
            name,
            image
          )
        `)
        .eq("approved", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending reviews:", error);
        throw error;
      }

      return data;
    },
  });
};

// Hook para aprobar una reseña
export const useApproveReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { data, error } = await supabase
        .from("reviews")
        // @ts-ignore - Tables not yet in generated types
        .update({ approved: true })
        .eq("id", reviewId)
        .select()
        .single();

      if (error) {
        console.error("Error approving review:", error);
        throw error;
      }

      return data as Review;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["pending-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", data.beer_id] });
      queryClient.invalidateQueries({ queryKey: ["beer-rating", data.beer_id] });
      queryClient.invalidateQueries({ queryKey: ["all-beer-ratings"] });
    },
  });
};

// Hook para eliminar una reseña
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, beerId }: { reviewId: string; beerId: string }) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) {
        console.error("Error deleting review:", error);
        throw error;
      }

      return { reviewId, beerId };
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["pending-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", data.beerId] });
      queryClient.invalidateQueries({ queryKey: ["beer-rating", data.beerId] });
      queryClient.invalidateQueries({ queryKey: ["all-beer-ratings"] });
    },
  });
};

// Hook para crear una reseña
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: ReviewInsert) => {
      const { data, error } = await supabase
        .from("reviews")
        // @ts-ignore - Tables not yet in generated types
        .insert(review)
        .select()
        .single();

      if (error) {
        console.error("Error creating review:", error);
        throw error;
      }

      return data as Review;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["pending-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", data.beer_id] });
      queryClient.invalidateQueries({ queryKey: ["beer-rating", data.beer_id] });
      queryClient.invalidateQueries({ queryKey: ["all-beer-ratings"] });
    },
  });
};

