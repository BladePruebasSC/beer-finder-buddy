import { filterCategories } from "@/data/filters";

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

export const getFilters = (): Filters => {
  initializeFilters();
  const stored = localStorage.getItem(FILTERS_KEY);
  return stored ? JSON.parse(stored) : filterCategories;
};

export const addFilterOption = (category: keyof Filters, option: FilterOption): void => {
  const filters = getFilters();
  if (!filters[category].options.find(opt => opt.id === option.id)) {
    filters[category].options.push(option);
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }
};

export const updateFilterOption = (
  category: keyof Filters, 
  optionId: string, 
  updates: Partial<FilterOption>
): void => {
  const filters = getFilters();
  const index = filters[category].options.findIndex(opt => opt.id === optionId);
  if (index !== -1) {
    filters[category].options[index] = { 
      ...filters[category].options[index], 
      ...updates 
    };
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }
};

export const deleteFilterOption = (category: keyof Filters, optionId: string): void => {
  const filters = getFilters();
  filters[category].options = filters[category].options.filter(opt => opt.id !== optionId);
  localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
};
