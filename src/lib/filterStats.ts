import { supabase } from "@/integrations/supabase/client";

// Sistema de tracking de FILTROS reales (no respuestas del chat)
const FILTER_STATS_KEY = 'beer-filter-stats';

// Función para actualizar estadísticas (ahora usa Supabase)
export const updateFilterStats = async (filterValue: string) => {
  try {
    // Actualizar en Supabase
    const { error } = await supabase.rpc("increment_filter_usage", {
      p_filter_value: filterValue,
    });

    if (error) {
      console.error('Error updating filter stats in Supabase:', error);
      // Fallback a localStorage si falla Supabase
      updateLocalFilterStats(filterValue);
    } else {
      console.log('📊 Estadísticas actualizadas en Supabase para:', filterValue);
    }
  } catch (error) {
    console.error('Error updating filter stats:', error);
    // Fallback a localStorage
    updateLocalFilterStats(filterValue);
  }
};

// Fallback a localStorage (mantener por si falla la conexión)
const updateLocalFilterStats = (filterValue: string) => {
  try {
    const stored = localStorage.getItem(FILTER_STATS_KEY);
    const stats = stored ? JSON.parse(stored) : {};
    stats[filterValue] = (stats[filterValue] || 0) + 1;
    localStorage.setItem(FILTER_STATS_KEY, JSON.stringify(stats));
    console.log('📊 Estadísticas actualizadas en localStorage para:', filterValue);
  } catch (error) {
    console.error('Error updating local filter stats:', error);
  }
};

// Función para obtener estadísticas (ahora desde Supabase)
export const getFilterStats = async (): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase
      .from("filter_stats")
      .select("filter_value, usage_count")
      .order("usage_count", { ascending: false });

    if (error) {
      console.error('Error getting filter stats from Supabase:', error);
      return getLocalFilterStats();
    }

    // Convertir a objeto { filterValue: count }
    const stats: Record<string, number> = {};
    data?.forEach((stat) => {
      stats[stat.filter_value] = stat.usage_count;
    });

    return stats;
  } catch (error) {
    console.error('Error getting filter stats:', error);
    return getLocalFilterStats();
  }
};

// Fallback para obtener desde localStorage
const getLocalFilterStats = (): Record<string, number> => {
  try {
    const stored = localStorage.getItem(FILTER_STATS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const clearFilterStats = async () => {
  try {
    // Limpiar de Supabase
    const { error } = await supabase
      .from("filter_stats")
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos

    if (error) {
      console.error('Error clearing filter stats from Supabase:', error);
    } else {
      console.log('🧹 Estadísticas de filtros eliminadas de Supabase');
    }

    // También limpiar localStorage
    localStorage.removeItem(FILTER_STATS_KEY);
    console.log('🧹 Estadísticas de filtros eliminadas de localStorage');
  } catch (error) {
    console.error('Error clearing filter stats:', error);
  }
};
