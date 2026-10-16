import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle2, ShieldCheck, Sparkles, Phone, FileText, ArrowRight, Wrench } from 'lucide-react';
import ProductBundles from '@/components/products/ProductBundles';

const BundlesPage = () => {
  return (
    <>
      <Helmet>
        <title>Equipment Bundles & Workstations | NextSens Technology</title>
        <meta
          name="description"
          content="Curated electrochemical workstation packages and testing bundles. Complete turnkey sets including Potentiostats, Galvanostats, EIS, and precision electrodes."
        />
        <link rel="canonical" href="https://www.nextsenstech.com/bundles" />
      </Helmet>

      <div className="bg-background text-foreground min-h-screen flex flex-col">
        {/* 1. Compact Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/40 via-background to-background py-6 md:py-8 border-b">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Turnkey Laboratory Packages</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                Curated <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-accent">Equipment Bundles</span>
              </h1>

              <p className="mt-2 text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                Save more with pre-configured instrument bundles designed for complete laboratory workflows — featuring Potentiostats, EIS workstations, and matched 3-electrode sets.
              </p>

              {/* Technical Value Badges */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Complete 3-Electrode Kits (WE / CE / RE)
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Save Up to 15% vs Individual Pricing
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Pre-Calibrated & Research-Ready
                </span>
                <span className="flex items-center gap-1.5 text-primary font-semibold">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  18% GST ITC Invoices
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. Product Bundles Grid */}
        <section className="py-8 bg-background flex-grow">
          <ProductBundles showHeading={false} className="border-0 bg-transparent py-0 md:py-0" />
        </section>

        {/* 3. Custom Bundle Solutions Section */}
        <section className="py-10 bg-secondary/30 border-t border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                <div className="lg:col-span-8 text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-2">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Custom Configurations</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Need a Custom Electrode or Cell Combination?
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    We routinely configure customized bundles for research laboratories, university departments, and industrial QA. Mix and match Potentiostats, specific Working Electrodes (Glassy Carbon, Platinum, Gold), Reference Probes (Ag/AgCl, Calomel, Hg/HgO, Hg/HgSO4), and specialized electrochemical cell sizes.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground font-medium">
                    <span>✓ Tailored to Your Application</span>
                    <span>✓ Official University Quote Generation</span>
                    <span>✓ Custom Cables & Connectors</span>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                  <Button asChild size="default" className="rounded-lg shadow-sm font-semibold text-xs h-10">
                    <Link to="/contact?subject=Custom%20Bundle%20Inquiry">
                      <FileText className="mr-2 h-4 w-4" />
                      Request Custom Bundle Quote
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="default" className="rounded-lg text-xs h-10 border-border hover:bg-muted">
                    <a href="tel:+919321175585">
                      <Phone className="mr-2 h-4 w-4 text-emerald-500" />
                      Direct Sales: +91-9321175585
                    </a>
                  </Button>
                </div>

              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BundlesPage;
