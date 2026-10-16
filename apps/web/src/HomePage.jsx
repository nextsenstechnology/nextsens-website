import React, { useState } from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { CheckCircle, Zap, ShieldCheck } from 'lucide-react';
    import CategoryFilter from '@/components/products/CategoryFilter';
    import QuoteRequestDialog from '@/components/products/QuoteRequestDialog';
    import ProductCarousel from '@/components/products/ProductCarousel';
    import ProductSearch from '@/components/products/ProductSearch';

    const HomePage = () => {
      const [quoteProduct, setQuoteProduct] = useState(null);
      const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);

      const handleQuoteRequest = (product) => {
        setQuoteProduct(product);
        setIsQuoteDialogOpen(true);
      };

      return (
        <>
          <Helmet>
            <title>NextSens Tech | Precision Electrochemical Instruments</title>
            <meta name="description" content="Welcome to NextSens Tech, your premier source for high-quality pH electrodes, Karl Fischer titrators, and other precision electrochemical instruments." />
            <link rel="canonical" href="https://www.nextsenstech.com" />
          </Helmet>

          {/* Hero Section */}
          <section className="bg-gradient-to-br from-secondary via-background to-muted py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight"
              >
                Precision in Every <span className="text-primary">Measurement</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground"
              >
                NextSens Tech provides high-performance electrochemical instruments for laboratories and industries worldwide.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-8 flex flex-wrap justify-center gap-4"
              >
                <Button asChild size="lg">
                  <Link to="/store">Go to Store</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/contact">Get a Quote</Link>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-12 max-w-xl mx-auto"
              >
                <ProductSearch />
              </motion.div>
            </div>
          </section>

          <CategoryFilter />

          {/* All Products Carousel Section */}
          <section className="py-16 bg-secondary/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground">Our Complete Catalog</h2>
                <p className="mt-2 text-lg text-muted-foreground">Our entire range of precision instruments, in motion.</p>
              </div>
              <ProductCarousel onQuoteRequest={handleQuoteRequest} />
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground">Why NextSens Tech?</h2>
                <p className="mt-2 text-lg text-muted-foreground">The advantage of choosing a dedicated partner in precision.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <Card>
                  <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mt-4">Unmatched Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Our instruments are built with the highest quality components to ensure accuracy and longevity.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mt-4">Innovative Technology</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">We leverage the latest technology to provide fast, reliable, and user-friendly solutions.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="mt-4">Expert Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Our dedicated team of experts is always ready to assist you with technical support and guidance.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
          {quoteProduct && (
            <QuoteRequestDialog
              product={quoteProduct}
              open={isQuoteDialogOpen}
              onOpenChange={setIsQuoteDialogOpen}
            />
          )}
        </>
      );
    };

    export default HomePage;