import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3 } from "lucide-react";

// Obtener estadísticas de filtros del localStorage
const getFilterStats = () => {
  try {
    const stored = localStorage.getItem('beer-filter-stats');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

interface StatEntry {
  answer: string;
  count: number;
  category: string;
}

const categorizeFilter = (filterName: string): string => {
  // Países
  const countries = ['República Dominicana', 'Estados Unidos', 'México', 'Alemania', 'Bélgica', 'Reino Unido', 'España', 'Irlanda', 'República Checa', 'Japón', 'Brasil', 'Argentina'];
  if (countries.includes(filterName)) {
    return '🌍 Países';
  }
  
  // Estilos
  const styles = ['IPA', 'Stout', 'Lager', 'Amber Ale', 'Wheat Beer', 'Hazy IPA', 'Porter', 'Red Ale', 'Pilsner', 'Pale Ale', 'Sour Ale', 'Belgian Ale'];
  if (styles.includes(filterName)) {
    return '🍺 Estilos';
  }
  
  // Sabores
  const flavors = ['Cítrico', 'Tropical', 'Chocolate', 'Café', 'Caramelo', 'Frutal', 'Nuez', 'Herbal', 'Pan tostado', 'Durazno', 'Frutos rojos', 'Naranja'];
  if (flavors.includes(filterName)) {
    return '🍋 Sabores';
  }
  
  // Intensidad
  const intensity = ['Ligera', 'Media', 'Fuerte'];
  if (intensity.includes(filterName)) {
    return '💪 Intensidad';
  }
  
  return 'Otros';
};

export const AIStatsChart = () => {
  const stats = getFilterStats();
  
  // Convertir a array y ordenar por uso
  const statsArray: StatEntry[] = Object.entries(stats)
    .map(([filterName, count]) => ({
      answer: filterName,
      count: count as number,
      category: categorizeFilter(filterName),
    }))
    .sort((a, b) => b.count - a.count);

  const totalInteractions = statsArray.reduce((sum, stat) => sum + stat.count, 0);

  // Agrupar por categoría
  const categorizedStats = statsArray.reduce((acc, stat) => {
    if (!acc[stat.category]) {
      acc[stat.category] = [];
    }
    acc[stat.category].push(stat);
    return acc;
  }, {} as Record<string, StatEntry[]>);

  if (totalInteractions === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
          <BarChart3 className="text-muted-foreground" size={28} />
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay estadísticas aún</h3>
        <p className="text-muted-foreground text-sm">
          Las estadísticas aparecerán cuando los usuarios interactúen con el chat IA
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">Estadísticas de Filtros IA</h3>
            <p className="text-sm text-muted-foreground">
              Filtros más buscados por los usuarios
            </p>
          </div>
          <Badge variant="default" className="flex items-center gap-2">
            <TrendingUp size={14} />
            {totalInteractions} búsquedas
          </Badge>
        </div>

        {/* Top 10 General */}
        <div className="space-y-3 mt-6">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Top 10 Filtros Más Buscados
          </h4>
          {statsArray.slice(0, 10).map((stat, index) => {
            const percentage = ((stat.count / totalInteractions) * 100).toFixed(1);
            return (
              <div key={stat.answer} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{stat.answer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{stat.count}x</span>
                    <Badge variant="outline" className="text-xs">
                      {percentage}%
                    </Badge>
                  </div>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Estadísticas por Categoría */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(categorizedStats).map(([category, entries]) => {
          const categoryTotal = entries.reduce((sum, e) => sum + e.count, 0);
          const categoryPercentage = ((categoryTotal / totalInteractions) * 100).toFixed(1);

          return (
            <Card key={category} className="p-5 bg-gradient-to-br from-card to-card/95">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg">{category}</h4>
                <Badge variant="secondary">
                  {categoryTotal} ({categoryPercentage}%)
                </Badge>
              </div>

              <div className="space-y-2">
                {entries.slice(0, 5).map((entry, index) => {
                  const entryPercentage = ((entry.count / categoryTotal) * 100).toFixed(0);
                  return (
                    <div key={entry.answer} className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 text-sm">
                        <span className={`${index === 0 ? 'text-primary' : ''}`}>
                          {entry.answer}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{entry.count}x</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              index === 0
                                ? 'bg-gradient-to-r from-primary to-accent'
                                : 'bg-muted-foreground/50'
                            }`}
                            style={{ width: `${entryPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Botón para limpiar estadísticas */}
      <Card className="p-4 bg-destructive/5 border-destructive/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-sm">Limpiar Estadísticas</h4>
            <p className="text-xs text-muted-foreground">
              Esto eliminará todas las estadísticas de interacciones
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres limpiar todas las estadísticas de filtros?')) {
                localStorage.removeItem('beer-filter-stats');
                window.location.reload();
              }
            }}
            className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
          >
            Limpiar Datos
          </button>
        </div>
      </Card>
    </div>
  );
};

