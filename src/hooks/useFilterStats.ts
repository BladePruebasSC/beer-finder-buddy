import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FilterStat {
  id: string;
  filter_value: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// Hook para obtener todas las estadísticas
export const useFilterStats = () => {
  return useQuery({
    queryKey: ["filter-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filter_stats")
        .select("*")
        .order("usage_count", { ascending: false });

      if (error) throw error;

      // Convertir a objeto { filterValue: count } para mantener compatibilidad
      const stats: Record<string, number> = {};
      data?.forEach((stat: FilterStat) => {
        stats[stat.filter_value] = stat.usage_count;
      });

      return stats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// Hook para incrementar el uso de un filtro
export const useIncrementFilterStat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filterValue: string) => {
      const { error } = await supabase.rpc("increment_filter_usage", {
        p_filter_value: filterValue,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidar la caché para refrescar las estadísticas
      queryClient.invalidateQueries({ queryKey: ["filter-stats"] });
    },
  });
};

// Hook para migrar datos de localStorage a Supabase (ejecutar una sola vez)
export const useMigrateFilterStats = () => {
  return useMutation({
    mutationFn: async () => {
      // Obtener datos de localStorage
      const FILTER_STATS_KEY = "beer-filter-stats";
      const stored = localStorage.getItem(FILTER_STATS_KEY);
      
      if (!stored) {
        console.log("No hay estadísticas en localStorage para migrar");
        return;
      }

      const stats = JSON.parse(stored);
      
      // Migrar cada estadística a Supabase
      for (const [filterValue, count] of Object.entries(stats)) {
        if (typeof count === "number" && count > 0) {
          // Insertar o actualizar
          const { error } = await supabase
            .from("filter_stats")
            .upsert({
              filter_value: filterValue,
              usage_count: count,
            }, {
              onConflict: "filter_value",
            });

          if (error) {
            console.error(`Error migrando ${filterValue}:`, error);
          }
        }
      }

      console.log("✅ Estadísticas migradas exitosamente");
      
      // Opcional: limpiar localStorage después de migrar
      // localStorage.removeItem(FILTER_STATS_KEY);
    },
  });
};

