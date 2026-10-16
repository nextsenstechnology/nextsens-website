import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Filter, Zap, FlaskConical, Package, Box, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { name: 'All Products', href: '/products', icon: <Filter className="h-5 w-5 mr-2" /> },
  { name: 'Electrodes', href: '/products/electrodes', icon: <Zap className="h-5 w-5 mr-2" /> },
  { name: 'Instruments', href: '/products/instruments', icon: <FlaskConical className="h-5 w-5 mr-2" /> },
  { name: 'Cells and Reactors', href: '/products/cells-and-reactors', icon: <Package className="h-5 w-5 mr-2" /> },
  { name: 'Materials', href: '/products/materials', icon: <Box className="h-5 w-5 mr-2" /> },
  { name: 'Accessories', href: '/products/accessories', icon: <Wrench className="h-5 w-5 mr-2" /> },
];

const CategoryFilter = () => {
  const location = useLocation();

  return (
    <div className="py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          {categories.map((category) => {
            const isActive = location.pathname === category.href;
            return (
              <motion.div
                key={category.name}
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link
                  to={category.href}
                  className={cn(
                    'flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg border',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-card text-foreground hover:bg-secondary'
                  )}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;