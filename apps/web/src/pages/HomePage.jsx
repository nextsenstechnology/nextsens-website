import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, ShieldCheck, Sparkles, CheckCircle2, ArrowRight, Shield, Award, Phone } from 'lucide-react';
import HomePageCategoryFilter from '@/components/products/HomePageCategoryFilter';
import ProductCarousel from '@/components/products/ProductCarousel';
import ProductSearch from '@/components/products/ProductSearch';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/lib/customSupabaseClient';

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
        setFilteredProducts(data || []);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category === selectedCategory);
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <Helmet>
        <title>NextSens Tech | Precision Electrochemical Instruments</title>
        <meta name="description" content="Welcome to NextSens Tech, your premier source for high-quality pH electrodes, Karl Fischer titrators, and other precision electrochemical instruments." />
        <link rel="canonical" href="https://www.nextsenstech.com" />
      </Helmet>

      {/* Refined High-Impact Scientific Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 via-background to-background py-12 md:py-20 border-b">
        {/* Subtle background tech grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left 7 Columns: Scientific Value Proposition & CTAs */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7 text-left"
            >
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-semibold mb-5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Precision Electrochemical Instrumentation</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.12]">
                Pioneering Precision in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-accent">Electrochemical Analysis</span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                High-stability pH glass electrodes, Karl Fischer titration probes, and electrochemical sensors. Engineered with low sodium-ion error membranes and zero-drift junctions for research laboratories and industrial quality control.
              </p>

              {/* Key Technical Badges */}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ±0.01 pH Lab-Grade Accuracy
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Universal Gold BNC / DIN Fit
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Fast Response (&lt;5 Seconds)
                </span>
              </div>

              {/* CTA Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="rounded-lg shadow-md hover:shadow-lg transition-all group font-semibold text-base px-6">
                  <Link to="/store">
                    Browse Online Store
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-lg font-semibold text-base px-6 border-border hover:bg-muted">
                  <Link to="/contact">Request Lab Quote</Link>
                </Button>
                <a
                  href="https://wa.me/919321175585?text=Hi%2C%20I%20am%20inquiring%20about%20NextSens%20electrochemical%20instruments"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline px-2 py-1 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Instant WhatsApp Inquiry
                </a>
              </div>

              {/* Instant Search Bar */}
              <div className="mt-8 pt-6 border-t border-border/80 max-w-xl">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Quick Catalog Search
                </p>
                <ProductSearch />
              </div>
            </motion.div>

            {/* Right 5 Columns: Visual Instrument Showcase Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              {/* Ambient Glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-3xl blur-2xl -z-10"></div>

              {/* Interactive Showcase Card */}
              <div className="bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 text-left">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      NextSens Flagship Series
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                    ISO Calibrated
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Precision Glass pH & Titration Electrodes
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Equipped with high-purity glass bulbs and porous ceramic junctions for research and industrial titrators.
                  </p>
                </div>

                {/* Technical Specs Grid */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Measuring Range</span>
                    <span className="font-bold text-foreground">0 – 14 pH</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Temperature Limit</span>
                    <span className="font-bold text-foreground">0°C to 80°C</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Junction Type</span>
                    <span className="font-bold text-foreground">Ceramic / Refillable</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Connector</span>
                    <span className="font-bold text-foreground">Gold-Plated BNC</span>
                  </div>
                </div>

                {/* Trust Badges Bar */}
                <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    GST Input Tax Credit
                  </span>
                  <span className="font-medium text-emerald-600">
                    Dispatched in 24–48h
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <HomePageCategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Filtered Products Section */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">
              {selectedCategory === 'all' ? 'All Products' : selectedCategory}
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              {selectedCategory === 'all' 
                ? 'Browse our complete range of precision instruments' 
                : `Explore our ${selectedCategory.toLowerCase()} collection`}
            </p>
          </div>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No products found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* All Products Carousel Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
            <p className="mt-2 text-lg text-muted-foreground">Our complete catalog, in motion.</p>
          </div>
          <ProductCarousel />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-secondary/30 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>Engineered for Laboratories & Industry</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">The NextSens Advantage</h2>
            <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Built to meet stringent electrochemical measurement standards across research and quality assurance.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-border/80 shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-left pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                  <Award className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Laboratory-Grade Precision</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Low sodium-ion error glass membranes and porous ceramic junctions deliver ±0.01 pH accuracy, rapid stability (&lt;5s), and minimal drift even in challenging buffer matrices.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-left pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                  <Zap className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Universal Instrument Compatibility</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Equipped with industry-standard gold-plated BNC and DIN connectors. Fully plug-and-play compatible with Metrohm, Thermo Orion, Hanna, and CHI workstations.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-left pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Direct Supply & GST Invoicing</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Direct manufacturer pricing with zero intermediary markups. Full 18% GST tax invoices issued instantly with Input Tax Credit (ITC) for universities and corporate buyers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;