import { filterCategories } from "@/data/filters";
import { supabase } from "@/integrations/supabase/client";

export interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

export interface FilterCategory {
  title: string;
  options: FilterOption[];
}

export interface Filters {
  style: FilterCategory;
  color: FilterCategory;
  flavor: FilterCategory;
  strength: FilterCategory;
  bitterness: FilterCategory;
  origin: FilterCategory;
}

const FILTERS_KEY = "filters_catalog";

// Función para inicializar filtros (mantener por compatibilidad con localStorage)
export const initializeFilters = () => {
  const stored = localStorage.getItem(FILTERS_KEY);
  if (!stored) {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filterCategories));
  } else {
    // Migrar filtros antiguos que no tienen la categoría origin
    try {
      const parsedFilters = JSON.parse(stored);
      if (!parsedFilters.origin) {
        parsedFilters.origin = filterCategories.origin;
        localStorage.setItem(FILTERS_KEY, JSON.stringify(parsedFilters));
      }
    } catch (error) {
      // Si hay error parseando, resetear a valores por defecto
      console.error('Error parsing filters, resetting to defaults:', error);
      localStorage.setItem(FILTERS_KEY, JSON.stringify(filterCategories));
    }
  }
};

// Función para obtener filtros desde Supabase (con fallback a localStorage)
export const getFilters = async (): Promise<Filters> => {
  try {
    const { data, error } = await supabase
      .from("filter_options")
      .select("*")
      .order("category", { ascending: true });

    if (error) {
      console.error('❌ Error obteniendo filtros desde Supabase:', error);
      console.log('🔄 Usando filtros desde localStorage');
      return getLocalFilters();
    }

    // Si no hay datos en Supabase, usar valores por defecto y migrar
    if (!data || data.length === 0) {
      console.log('⚠️ No hay filtros en Supabase, usando valores por defecto');
      return filterCategories;
    }

    // Convertir datos de Supabase a estructura de Filters
    const filters: Filters = {
      style: { title: "Estilo", options: [] },
      color: { title: "Color", options: [] },
      flavor: { title: "Sabor", options: [] },
      strength: { title: "Graduación", options: [] },
      bitterness: { title: "Amargor", options: [] },
      origin: { title: "Origen", options: [] },
    };

    data.forEach((option: any) => {
      const category = option.category as keyof Filters;
      if (filters[category]) {
        filters[category].options.push({
          id: option.id,
          label: option.label,
          icon: option.icon,
        });
      }
    });

    console.log('✅ Filtros cargados desde Supabase');
    
    // Sincronizar con localStorage
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    
    return filters;
  } catch (error) {
    console.error('❌ Error obteniendo filtros:', error);
    console.log('🔄 Usando filtros desde localStorage');
    return getLocalFilters();
  }
};

// Fallback para obtener filtros desde localStorage
const getLocalFilters = (): Filters => {
  initializeFilters();
  const stored = localStorage.getItem(FILTERS_KEY);
  return stored ? JSON.parse(stored) : filterCategories;
};

// Función para agregar opción de filtro en Supabase
export const addFilterOption = async (category: keyof Filters, option: FilterOption): Promise<void> => {
  try {
    const { error } = await supabase.from("filter_options").insert({
      id: option.id,
      category: category,
      label: option.label,
      icon: option.icon,
      is_default: false,
    });

    if (error) {
      console.error('Error agregando opción de filtro en Supabase:', error);
      // Fallback a localStorage
      addLocalFilterOption(category, option);
    } else {
      console.log('✅ Opción de filtro agregada en Supabase:', option.label);
    }
  } catch (error) {
    console.error('Error agregando opción de filtro:', error);
    addLocalFilterOption(category, option);
  }
};

// Fallback para agregar en localStorage
const addLocalFilterOption = (category: keyof Filters, option: FilterOption): void => {
  const filters = getLocalFilters();
  if (!filters[category].options.find(opt => opt.id === option.id)) {
    filters[category].options.push(option);
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    console.log('✅ Opción de filtro agregada en localStorage:', option.label);
  }
};

// Función para actualizar opción de filtro en Supabase
export const updateFilterOption = async (
  category: keyof Filters, 
  optionId: string, 
  updates: Partial<FilterOption>
): Promise<void> => {
  try {
    console.log('🔄 Actualizando filtro:', { category, optionId, updates });
    
    const { data, error } = await supabase
      .from("filter_options")
      .update({
        label: updates.label,
        icon: updates.icon,
        updated_at: new Date().toISOString(),
      })
      .eq("id", optionId)
      .eq("category", category)
      .select(); // Agregar select para ver qué se actualizó

    if (error) {
      console.error('❌ Error actualizando opción de filtro en Supabase:', error);
      // Fallback a localStorage
      updateLocalFilterOption(category, optionId, updates);
      return; // No lanzar error, usar localStorage
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No se encontró el filtro para actualizar en Supabase, usando localStorage:', { category, optionId });
      // Fallback a localStorage
      updateLocalFilterOption(category, optionId, updates);
      return;
    }

    console.log('✅ Opción de filtro actualizada en Supabase:', data[0]);
    
    // También actualizar localStorage para sincronización
    updateLocalFilterOption(category, optionId, updates);
  } catch (error) {
    console.error('❌ Error actualizando opción de filtro:', error);
    // Fallback a localStorage
    updateLocalFilterOption(category, optionId, updates);
  }
};

// Fallback para actualizar en localStorage
const updateLocalFilterOption = (
  category: keyof Filters, 
  optionId: string, 
  updates: Partial<FilterOption>
): void => {
  const filters = getLocalFilters();
  const index = filters[category].options.findIndex(opt => opt.id === optionId);
  if (index !== -1) {
    filters[category].options[index] = { 
      ...filters[category].options[index], 
      ...updates 
    };
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
    console.log('✅ Opción de filtro actualizada en localStorage');
  }
};

// Función para eliminar opción de filtro en Supabase
export const deleteFilterOption = async (category: keyof Filters, optionId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("filter_options")
      .delete()
      .eq("id", optionId)
      .eq("category", category);

    if (error) {
      console.error('Error eliminando opción de filtro en Supabase:', error);
      // Fallback a localStorage
      deleteLocalFilterOption(category, optionId);
    } else {
      console.log('✅ Opción de filtro eliminada en Supabase');
    }
  } catch (error) {
    console.error('Error eliminando opción de filtro:', error);
    deleteLocalFilterOption(category, optionId);
  }
};

// Fallback para eliminar en localStorage
const deleteLocalFilterOption = (category: keyof Filters, optionId: string): void => {
  const filters = getLocalFilters();
  filters[category].options = filters[category].options.filter(opt => opt.id !== optionId);
  localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  console.log('✅ Opción de filtro eliminada en localStorage');
};
