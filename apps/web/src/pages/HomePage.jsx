import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, CheckCircle2, ArrowRight, Shield, Award, Phone, Zap, ShieldCheck, X } from 'lucide-react';
import SearchBar from '@/components/products/SearchBar';
import CategoryFilterBar from '@/components/products/CategoryFilterBar';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/lib/customSupabaseClient';

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  // Filter products by selected category and live search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Category check
      if (selectedCategory !== 'all') {
        const selCat = selectedCategory.toLowerCase();
        const prodCat = product.category?.toLowerCase() || '';
        const match = prodCat === selCat || prodCat.includes(selCat) || selCat.includes(prodCat);
        if (!match) return false;
      }

      // 2. Search query check
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = product.name?.toLowerCase().includes(q);
        const catMatch = product.category?.toLowerCase().includes(q);
        const descMatch = product.short_description?.toLowerCase().includes(q);
        const featMatch = product.features?.some(f => f.toLowerCase().includes(q));
        const specMatch = product.specifications
          ? Object.values(product.specifications).some(v => String(v).toLowerCase().includes(q))
          : false;

        if (!nameMatch && !catMatch && !descMatch && !featMatch && !specMatch) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <>
      <Helmet>
        <title>NextSens Tech | Potentiostat, Galvanostat & EIS Bundles</title>
        <meta 
          name="description" 
          content="Research-grade Potentiostat, Galvanostat, and EIS workstation bundles with working, counter, and reference electrodes for battery and corrosion testing." 
        />
        <link rel="canonical" href="https://www.nextsenstech.com" />
      </Helmet>

      {/* 1. Ultra-Compact Scientific Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 via-background to-background py-4 md:py-6 border-b">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left Content */}
            <div className="max-w-2xl text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold mb-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <span>Turnkey Electrochemical Workstations</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                Potentiostat, Galvanostat & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-accent">EIS Bundles</span>
              </h1>

              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Complete electrochemical workstations bundled with calibrated working, counter, and reference electrodes for battery research, corrosion analysis, and electrochemistry.
              </p>

              {/* Technical Badges in a single compact row */}
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs font-medium text-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  Complete 3-Electrode Bundle (WE / CE / RE)
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  EIS & Voltammetry Ready
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  Battery & Corrosion Testing
                </span>
                <span className="flex items-center gap-1 text-primary font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  18% GST ITC Invoices
                </span>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end justify-start gap-2 shrink-0 pt-2 md:pt-0">
              <div className="flex items-center gap-2">
                <Button asChild size="sm" className="rounded-lg shadow-sm font-semibold text-xs px-4 h-9 group">
                  <Link to="/store">
                    Browse Store
                    <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-lg font-semibold text-xs px-4 h-9 border-border hover:bg-muted">
                  <Link to="/contact">Request Lab Quote</Link>
                </Button>
              </div>
              <a
                href="https://wa.me/919321175585?text=Hi%2C%20I%20am%20inquiring%20about%20NextSens%20electrochemical%20instruments"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline px-1 py-0.5 transition-colors"
              >
                <Phone className="w-3 h-3" />
                Instant WhatsApp Inquiry (+91-9321175585)
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Compact Store Products & Category Filters Section */}
      <section id="products-catalog" className="py-4 md:py-6 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Bar: Search Bar */}
          <div className="mb-2.5">
            <SearchBar 
              products={products} 
              onSearchChange={(q) => setSearchQuery(q)} 
            />
          </div>

          {/* Category Filter Bar (Store Component) */}
          <div className="mb-3">
            <CategoryFilterBar 
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Compact Status Line directly above products (Minimal Spacing) */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-3 px-1 border-b pb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Available
              </span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-accent/10 text-accent font-medium px-2 py-0.5 rounded text-xs">
                  Category: {selectedCategory}
                  <button 
                    onClick={() => setSelectedCategory('all')} 
                    className="hover:text-foreground ml-0.5"
                    title="Clear category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary font-medium px-2 py-0.5 rounded text-xs">
                  Search: "{searchQuery}"
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="hover:text-foreground ml-0.5"
                    title="Clear search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {(selectedCategory !== 'all' || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-accent hover:underline font-medium"
                >
                  Reset Filters
                </button>
              )}
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-xs font-semibold text-primary hover:text-accent p-0 h-auto">
                <Link to="/store">Open Full Store →</Link>
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-xs text-muted-foreground">Loading instruments...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid-products">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-xl bg-card">
              <p className="text-sm font-medium text-foreground">
                No products found matching your selection.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try selecting "All Products" or modifying your search term.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetFilters} 
                className="mt-3 text-xs"
              >
                Show All Products
              </Button>
            </div>
          )}

          {/* Mobile store link button */}
          <div className="mt-6 text-center sm:hidden">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link to="/store">View Store with Advanced Sidebar Filters →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 3. Compact "Why NextSens Tech" Section */}
      <section className="py-8 md:py-10 bg-secondary/30 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold mb-1.5">
              <Award className="w-3 h-3" />
              <span>Engineered for Laboratories & Industry</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">The NextSens Advantage</h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Built to meet stringent electrochemical measurement standards across research and quality assurance.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="border border-border/80 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="text-left pb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1.5">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">Laboratory-Grade Precision</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Low sodium-ion error glass membranes and porous ceramic junctions deliver ±0.01 pH accuracy, rapid stability (&lt;5s), and minimal drift even in challenging buffer matrices.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="text-left pb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1.5">
                  <Zap className="h-4.5 w-4.5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">Universal Instrument Compatibility</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Equipped with industry-standard gold-plated BNC and DIN connectors. Fully plug-and-play compatible with Metrohm, Thermo Orion, Hanna, and CHI workstations.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/80 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="text-left pb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1.5">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">Direct Supply & GST Invoicing</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <p className="text-xs text-muted-foreground leading-relaxed">
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