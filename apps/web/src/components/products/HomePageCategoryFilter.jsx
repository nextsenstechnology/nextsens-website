import React from 'react';
import { cn } from '@/lib/utils';
import { Filter, Zap, FlaskConical, Package, Box, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { name: 'All Products', value: 'all', icon: <Filter className="h-5 w-5 mr-2" /> },
  { name: 'Electrodes', value: 'Electrodes', icon: <Zap className="h-5 w-5 mr-2" /> },
  { name: 'Instruments', value: 'Instruments', icon: <FlaskConical className="h-5 w-5 mr-2" /> },
  { name: 'Cells and Reactors', value: 'Cells and Reactors', icon: <Package className="h-5 w-5 mr-2" /> },
  { name: 'Materials', value: 'Materials', icon: <Box className="h-5 w-5 mr-2" /> },
  { name: 'Accessories', value: 'Accessories', icon: <Wrench className="h-5 w-5 mr-2" /> },
];

const HomePageCategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          {categories.map((category) => {
            const isActive = selectedCategory === category.value;
            return (
              <motion.div
                key={category.value}
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <button
                  onClick={() => onCategoryChange(category.value)}
                  className={cn(
                    'flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg border',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-card text-foreground hover:bg-secondary'
                  )}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePageCategoryFilter;