import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp, X } from "lucide-react";

interface FilterOption {
  id: string;
  label: string;
  icon?: string;
}

interface CollapsibleFilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedFilters: string[];
  onFilterToggle: (filterId: string) => void;
}

export const CollapsibleFilterSection = ({ 
  title, 
  options, 
  selectedFilters, 
  onFilterToggle 
}: CollapsibleFilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCount = selectedFilters.length;

  return (
    <Card className="overflow-hidden bg-card border-border shadow-sm hover:shadow-[var(--shadow-soft)] transition-[var(--transition-smooth)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {selectedCount > 0 && (
            <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
              {selectedCount}
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="text-muted-foreground" size={20} />
        ) : (
          <ChevronDown className="text-muted-foreground" size={20} />
        )}
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 pt-2">
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
        </div>
      )}
    </Card>
  );
};
