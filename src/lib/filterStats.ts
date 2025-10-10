// Sistema de tracking de FILTROS reales (no respuestas del chat)
const FILTER_STATS_KEY = 'beer-filter-stats';

export const updateFilterStats = (filterValue: string) => {
  try {
    const stored = localStorage.getItem(FILTER_STATS_KEY);
    const stats = stored ? JSON.parse(stored) : {};
    stats[filterValue] = (stats[filterValue] || 0) + 1;
    localStorage.setItem(FILTER_STATS_KEY, JSON.stringify(stats));
    console.log('📊 Estadísticas actualizadas para:', filterValue);
  } catch (error) {
    console.error('Error updating filter stats:', error);
  }
};

export const getFilterStats = () => {
  try {
    const stored = localStorage.getItem(FILTER_STATS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const clearFilterStats = () => {
  try {
    localStorage.removeItem(FILTER_STATS_KEY);
    console.log('🧹 Estadísticas de filtros eliminadas');
  } catch (error) {
    console.error('Error clearing filter stats:', error);
  }
};
