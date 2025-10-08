import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Beer = Tables<"beers">;
export type BeerInsert = Omit<Beer, 'id' | 'created_at' | 'updated_at'>;
export type BeerUpdate = Partial<BeerInsert>;

const BEERS_QUERY_KEY = "beers";

// Hook para obtener todas las cervezas
export const useBeers = () => {
  return useQuery({
    queryKey: [BEERS_QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Error al cargar las cervezas");
        throw error;
      }

      return data as Beer[];
    },
  });
};

// Hook para obtener una cerveza por ID
export const useBeer = (id: string | undefined) => {
  return useQuery({
    queryKey: [BEERS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("beers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Error al cargar la cerveza");
        throw error;
      }

      return data as Beer;
    },
    enabled: !!id,
  });
};

// Hook para crear una cerveza
export const useCreateBeer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (beer: BeerInsert) => {
      const { data, error } = await supabase
        .from("beers")
        .insert([beer])
        .select()
        .single();

      if (error) throw error;
      return data as Beer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BEERS_QUERY_KEY] });
      toast.success("Cerveza creada exitosamente");
    },
    onError: (error) => {
      console.error("Error creating beer:", error);
      toast.error("Error al crear la cerveza");
    },
  });
};

// Hook para actualizar una cerveza
export const useUpdateBeer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BeerUpdate }) => {
      const { data, error } = await supabase
        .from("beers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Beer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [BEERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BEERS_QUERY_KEY, data.id] });
      toast.success("Cerveza actualizada exitosamente");
    },
    onError: (error) => {
      console.error("Error updating beer:", error);
      toast.error("Error al actualizar la cerveza");
    },
  });
};

// Hook para eliminar una cerveza
export const useDeleteBeer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("beers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BEERS_QUERY_KEY] });
      toast.success("Cerveza eliminada exitosamente");
    },
    onError: (error) => {
      console.error("Error deleting beer:", error);
      toast.error("Error al eliminar la cerveza");
    },
  });
};

