import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = ({ products }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(query);
      const categoryMatch = product.category?.toLowerCase().includes(query);
      const descriptionMatch = product.short_description?.toLowerCase().includes(query);
      const featuresMatch = product.features?.some(f => f.toLowerCase().includes(query));
      const specsMatch = product.specifications
        ? Object.values(product.specifications).some(v =>
            String(v).toLowerCase().includes(query)
          )
        : false;

      return nameMatch || categoryMatch || descriptionMatch || featuresMatch || specsMatch;
    });

    setSearchResults(filtered.slice(0, 5));
    setIsOpen(filtered.length > 0);
  }, [searchQuery, products]);

  const formatPrice = (price, currency) => {
    if (price === null || price === undefined) return "Price on request";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(price);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-accent" />
        <Input
          type="text"
          placeholder="Search products by name, category, or specifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-12 py-6 text-base bg-card text-foreground border-border rounded-xl shadow-sm focus:shadow-md focus:border-accent focus:ring-accent smooth-transition"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-card rounded-xl shadow-lg border border-border overflow-hidden"
          >
            <div className="p-2">
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted smooth-transition"
                >
                  <div className="w-16 h-16 flex-shrink-0 bg-white border border-border rounded-md flex items-center justify-center p-1">
                    <img
                      src={product.image_url || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2VkZWZlZSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+Cg=="}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-foreground line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {product.category || 'Uncategorized'}
                    </p>
                    <p className="text-sm font-semibold text-accent">
                      {formatPrice(product.price, product.currency)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;