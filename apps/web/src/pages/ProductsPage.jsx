import React from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import ProductsList from '@/components/ProductsList';
    import CategoryFilter from '@/components/products/CategoryFilter';
    
    const ProductsPage = () => {
      return (
        <>
          <Helmet>
            <title>All Products | NextSens Tech</title>
            <meta name="description" content="Explore our complete catalog of high-quality electrodes and precision instruments for various applications." />
            <link rel="canonical" href="https://www.nextsenstech.com/products" />
          </Helmet>
    
          <div className="bg-gradient-to-b from-secondary/20 to-background">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl"
              >
                Our <span className="text-primary">Products</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground"
              >
                Discover our comprehensive range of precision instruments.
              </motion.p>
            </div>
          </div>
          
          <CategoryFilter />
    
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <ProductsList />
          </div>
        </>
      );
    };
    
    export default ProductsPage;