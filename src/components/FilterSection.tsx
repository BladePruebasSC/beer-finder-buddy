import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  icon?: string;
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedFilters: string[];
  onFilterToggle: (filterId: string) => void;
}

export const FilterSection = ({ title, options, selectedFilters, onFilterToggle }: FilterSectionProps) => {
  return (
    <Card className="p-6 bg-card border-border shadow-[var(--shadow-soft)] transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-beer)]">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedFilters.includes(option.id);
          return (
            <Badge
              key={option.id}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 text-sm transition-[var(--transition-smooth)] ${
                isSelected
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[var(--shadow-beer)]"
                  : "hover:bg-muted"
              }`}
              onClick={() => onFilterToggle(option.id)}
            >
              {option.icon && <span className="mr-2">{option.icon}</span>}
              {option.label}
              {isSelected && <X className="ml-2 h-3 w-3" />}
            </Badge>
          );
        })}
      </div>
    </Card>
  );
};
