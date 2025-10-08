/**
 * Script de migración para actualizar los filtros en localStorage
 * Este archivo contiene funciones para migrar datos antiguos al nuevo formato
 */

import { filterCategories } from "@/data/filters";

const FILTERS_KEY = "filters_catalog";
const MIGRATION_VERSION_KEY = "filters_migration_version";
const CURRENT_MIGRATION_VERSION = "1.1.0"; // Versión con soporte de origin

/**
 * Verifica y aplica migraciones necesarias en los filtros
 */
export const migrateFiltersIfNeeded = () => {
  try {
    const currentVersion = localStorage.getItem(MIGRATION_VERSION_KEY);
    
    // Si ya está en la versión actual, no hacer nada
    if (currentVersion === CURRENT_MIGRATION_VERSION) {
      return;
    }

    console.log('[Filter Migration] Iniciando migración de filtros...');
    
    const stored = localStorage.getItem(FILTERS_KEY);
    
    if (!stored) {
      // Si no hay filtros, inicializar con valores por defecto
      localStorage.setItem(FILTERS_KEY, JSON.stringify(filterCategories));
      localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION);
      console.log('[Filter Migration] Filtros inicializados por primera vez');
      return;
    }

    // Intentar parsear los filtros existentes
    let filters;
    try {
      filters = JSON.parse(stored);
    } catch (parseError) {
      console.error('[Filter Migration] Error parseando filtros, reseteando:', parseError);
      localStorage.setItem(FILTERS_KEY, JSON.stringify(filterCategories));
      localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION);
      return;
    }

    // Aplicar migración: agregar categoría origin si no existe
    let needsUpdate = false;
    
    if (!filters.origin) {
      console.log('[Filter Migration] Agregando categoría de origen...');
      filters.origin = filterCategories.origin;
      needsUpdate = true;
    }

    // Verificar que todas las categorías tengan estructura correcta
    const categories = ['style', 'color', 'flavor', 'strength', 'bitterness', 'origin'];
    for (const category of categories) {
      if (!filters[category] || !filters[category].options || !Array.isArray(filters[category].options)) {
        console.log(`[Filter Migration] Reparando categoría ${category}...`);
        filters[category] = filterCategories[category as keyof typeof filterCategories];
        needsUpdate = true;
      }
    }

    // Guardar si hubo cambios
    if (needsUpdate) {
      localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
      console.log('[Filter Migration] Filtros actualizados correctamente');
    }

    // Actualizar versión de migración
    localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION);
    console.log('[Filter Migration] Migración completada exitosamente');
    
  } catch (error) {
    console.error('[Filter Migration] Error durante la migración:', error);
    // En caso de error crítico, resetear a valores por defecto
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filterCategories));
    localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION);
  }
};

/**
 * Fuerza un reset completo de los filtros (usar con cuidado)
 */
export const resetFiltersToDefaults = () => {
  console.warn('[Filter Migration] Reseteando filtros a valores por defecto...');
  localStorage.setItem(FILTERS_KEY, JSON.stringify(filterCategories));
  localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_MIGRATION_VERSION);
  console.log('[Filter Migration] Filtros reseteados correctamente');
};

/**
 * Obtiene la versión actual de migración
 */
export const getCurrentMigrationVersion = (): string => {
  return localStorage.getItem(MIGRATION_VERSION_KEY) || "0.0.0";
};

