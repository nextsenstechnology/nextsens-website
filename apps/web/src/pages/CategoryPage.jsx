import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import ProductCard from '@/components/products/ProductCard';
import { Loader2 } from 'lucide-react';

const categoryMapping = {
  'electrodes': 'Electrodes',
  'instruments': 'Instruments',
  'cells-and-reactors': 'Cells and Reactors',
  'materials': 'Materials',
  'accessories': 'Accessories'
};

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryName = categoryMapping[category] || category;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', categoryName)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, categoryName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{categoryName} | NextSens Technology</title>
        <meta
          name="description"
          content={`Browse our selection of ${categoryName.toLowerCase()} for precision electrochemical measurements.`}
        />
      </Helmet>

      <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">{categoryName}</h1>
            <p className="text-lg text-muted-foreground">
              Explore our range of {categoryName.toLowerCase()} designed for precision and reliability.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No products found in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;