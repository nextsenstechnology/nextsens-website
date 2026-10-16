import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CategoryFilterBar = ({ selectedCategory, onCategoryChange, className }) => {
  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'Electrodes', label: 'Electrodes' },
    { id: 'Instruments', label: 'Instruments' },
    { id: 'Cells & Reactors', label: 'Cells & Reactors' },
    { id: 'Materials & Accessories', label: 'Materials & Accessories' }
  ];

  return (
    <div className={cn("bg-card border border-border rounded-xl shadow-sm p-2 sm:p-2.5", className)}>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'rounded-lg px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium transition-all duration-200 h-8 sm:h-9',
              selectedCategory === category.id
                ? 'bg-accent text-white shadow-sm hover:bg-primary font-semibold'
                : 'bg-muted/70 text-foreground hover:bg-muted hover:text-accent'
            )}
          >
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilterBar;