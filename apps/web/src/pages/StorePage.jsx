import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ProductsList from '@/components/ProductsList';
import ProductBundles from '@/components/products/ProductBundles';
import SearchBar from '@/components/products/SearchBar';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const StorePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      setProducts(data || []);
    };
    fetchProducts();
  }, []);

  return (
    <>
      <Helmet>
        <title>Online Store | NextSens Technology</title>
        <meta
          name="description"
          content="Browse and purchase high-precision electrochemical instruments, electrodes, and accessories from NextSens Technology. Trusted by research laboratories and industries."
        />
        <link rel="canonical" href="https://www.nextsenstech.com/store" />
      </Helmet>

      <div className="bg-background text-foreground min-h-screen flex flex-col">
        {/* 1) Compact Heading */}
        <div className="bg-muted/30 py-2 md:py-3 border-b border-border text-center px-4 w-full">
          <p className="text-sm md:text-base text-muted-foreground font-medium max-w-4xl mx-auto leading-tight">
            <strong className="text-foreground">Browse Our Instruments</strong> – High-precision electrochemical instruments for corrosion testing, battery research, water analysis, and laboratory applications
          </p>
        </div>

        {/* 2) Search Bar Component */}
        <section className="py-2 md:py-4 bg-card border-b border-border sticky top-[72px] z-30 shadow-sm w-full">
          <div className="container-premium">
            <SearchBar products={products} />
          </div>
        </section>

        {/* 3) ProductsList Component */}
        <section id="products" className="py-4 md:py-6 w-full flex-grow">
          <div className="container-premium">
            <ProductsList />
          </div>
        </section>

        {/* 4) ProductBundles Component */}
        <section className="py-4 md:py-6 bg-muted/10 border-t border-b border-border w-full">
          <div className="container-premium">
            <ProductBundles />
          </div>
        </section>

        {/* Support CTA (Compact) */}
        <section className="py-8 bg-[#1F2937] text-white w-full mt-auto">
          <div className="container-premium text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-white">
                Need Help Choosing the Right Instrument?
              </h2>
              <p className="text-sm md:text-base mb-5 text-gray-300">
                Our technical experts are ready to assist you with product selection and custom solutions.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild size="sm" className="rounded-md bg-accent hover:bg-primary text-white border-0 transition-colors">
                  <Link to="/contact">Contact Our Experts</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-md bg-transparent border border-white text-white hover:bg-white hover:text-[#1F2937] transition-all">
                  <a href="tel:+919321175585">Call: +91-9321175585</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default StorePage;