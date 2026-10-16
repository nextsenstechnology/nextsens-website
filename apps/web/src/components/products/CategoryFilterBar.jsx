import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CategoryFilterBar = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'Electrodes', label: 'Electrodes' },
    { id: 'Instruments', label: 'Instruments' },
    { id: 'Cells & Reactors', label: 'Cells & Reactors' },
    { id: 'Materials & Accessories', label: 'Materials & Accessories' }
  ];

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'rounded-md px-6 py-2 font-medium transition-all duration-300',
              selectedCategory === category.id
                ? 'bg-accent text-white shadow-sm scale-105 hover:bg-primary'
                : 'bg-muted text-foreground hover:bg-muted/80 hover:text-accent hover:scale-105'
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