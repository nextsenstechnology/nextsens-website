import React, { useState, useEffect } from 'react';
import { Loader2, Filter as FilterIcon } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import ProductCard from '@/components/products/ProductCard';
import FilterSidebar from '@/components/products/FilterSidebar';
import CategoryFilterBar from '@/components/products/CategoryFilterBar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 500000],
    applications: [],
    availability: []
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('products')
          .select('*')
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    // Category filter from CategoryFilterBar
    if (selectedCategory !== 'all') {
      result = result.filter(product => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sidebar category filter
    if (filters.categories.length > 0) {
      result = result.filter(product =>
        filters.categories.some(cat => 
          product.category?.toLowerCase().includes(cat.toLowerCase()) ||
          product.name.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    // Price range filter
    result = result.filter(product => {
      if (product.price === null || product.price === undefined) return true;
      return product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
    });

    // Application filter
    if (filters.applications.length > 0) {
      result = result.filter(product => {
        const searchText = `${product.name} ${product.short_description} ${product.features?.join(' ')}`.toLowerCase();
        return filters.applications.some(app => searchText.includes(app.toLowerCase()));
      });
    }

    // Availability filter
    if (filters.availability.length > 0) {
      result = result.filter(product => {
        const hasPrice = product.price !== null && product.price !== undefined;
        if (filters.availability.includes('in-stock') && !hasPrice) return false;
        if (filters.availability.includes('made-to-order') && hasPrice) return false;
        return true;
      });
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8 bg-destructive/10 rounded-lg">
        <p>Error loading products: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <CategoryFilterBar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="flex gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
          />
        </aside>

        {/* Mobile Filter Button & Sheet */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full shadow-2xl">
                <FilterIcon className="mr-2 h-5 w-5" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 overflow-y-auto">
              <div className="p-6">
                <FilterSidebar
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClose={() => setIsMobileFilterOpen(false)}
                  isMobile
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Products Grid */}
        <div className="flex-grow">
          <div className="mb-6">
            <p className="text-lg font-semibold text-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center text-muted-foreground p-8 premium-card">
              <p className="text-lg">No products match your filters.</p>
              <p className="mt-2">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid-products">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsList;