import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FilterOption, Filters } from "@/lib/filterStorage";

interface FilterOptionDB {
  id: string;
  category: string;
  label: string;
  icon: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Hook para obtener todas las opciones de filtros desde Supabase
export const useFilterOptions = () => {
  return useQuery({
    queryKey: ["filter-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filter_options")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;

      // Convertir a estructura de Filters
      const filters: Filters = {
        style: { title: "Estilo", options: [] },
        color: { title: "Color", options: [] },
        flavor: { title: "Sabor", options: [] },
        strength: { title: "Graduación", options: [] },
        bitterness: { title: "Amargor", options: [] },
        origin: { title: "Origen", options: [] },
      };

      data?.forEach((option: FilterOptionDB) => {
        const category = option.category as keyof Filters;
        if (filters[category]) {
          filters[category].options.push({
            id: option.id,
            label: option.label,
            icon: option.icon,
          });
        }
      });

      return filters;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// Hook para agregar una nueva opción de filtro
export const useAddFilterOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      category,
      option,
    }: {
      category: keyof Filters;
      option: FilterOption;
    }) => {
      const { error } = await supabase.from("filter_options").insert({
        id: option.id,
        category: category,
        label: option.label,
        icon: option.icon,
        is_default: false,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filter-options"] });
    },
  });
};

// Hook para actualizar una opción de filtro existente
export const useUpdateFilterOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      category,
      optionId,
      updates,
    }: {
      category: keyof Filters;
      optionId: string;
      updates: Partial<FilterOption>;
    }) => {
      const { error } = await supabase
        .from("filter_options")
        .update({
          label: updates.label,
          icon: updates.icon,
          updated_at: new Date().toISOString(),
        })
        .eq("id", optionId)
        .eq("category", category);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filter-options"] });
    },
  });
};

// Hook para eliminar una opción de filtro
export const useDeleteFilterOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      category,
      optionId,
    }: {
      category: keyof Filters;
      optionId: string;
    }) => {
      const { error } = await supabase
        .from("filter_options")
        .delete()
        .eq("id", optionId)
        .eq("category", category);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filter-options"] });
    },
  });
};

// Hook para migrar datos de localStorage a Supabase (ejecutar una sola vez)
export const useMigrateFilterOptions = () => {
  return useMutation({
    mutationFn: async () => {
      // Obtener datos de localStorage
      const FILTERS_KEY = "filters_catalog";
      const stored = localStorage.getItem(FILTERS_KEY);
      
      if (!stored) {
        console.log("No hay opciones de filtros en localStorage para migrar");
        return;
      }

      const filters = JSON.parse(stored);
      
      // Migrar cada categoría a Supabase
      for (const [category, categoryData] of Object.entries(filters)) {
        const options = (categoryData as any).options || [];
        
        for (const option of options) {
          // Insertar o actualizar (upsert)
          const { error } = await supabase
            .from("filter_options")
            .upsert({
              id: option.id,
              category: category,
              label: option.label,
              icon: option.icon,
              is_default: false,
            }, {
              onConflict: "id",
            });

          if (error) {
            console.error(`Error migrando opción ${option.label}:`, error);
          }
        }
      }

      console.log("✅ Opciones de filtros migradas exitosamente");
      
      // Opcional: marcar como migrado en localStorage
      localStorage.setItem("filters_migrated", "true");
    },
  });
};

