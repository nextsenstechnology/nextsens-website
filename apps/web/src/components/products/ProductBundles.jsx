import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, TrendingDown, Loader2, Check, FileText, ShieldCheck, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useCart } from '@/hooks/useCart';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const ProductBundles = ({ 
  className = '', 
  title = 'Equipment Bundles', 
  subtitle = 'Save more with our curated instrument packages designed for complete laboratory solutions',
  showHeading = true 
}) => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [bundles, setBundles] = useState([]);
  const [productsById, setProductsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedBundle, setSelectedBundle] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [bundlesRes, productsRes] = await Promise.all([
          supabase
            .from('bundles')
            .select('*')
            .eq('status', 'active')
            .order('sort_order', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: false }),
          supabase.from('products').select('id, name, category, price'),
        ]);

        if (cancelled) return;

        if (bundlesRes.error) throw bundlesRes.error;
        if (productsRes.error) throw productsRes.error;

        const map = {};
        (productsRes.data || []).forEach((p) => {
          map[p.id] = p;
        });

        setProductsById(map);
        setBundles(bundlesRes.data || []);
      } catch (error) {
        if (!cancelled) {
          toast({
            variant: 'destructive',
            title: 'Failed to load bundles',
            description: error.message || 'Please try again later.',
          });
          setBundles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(price) || 0);
  };

  const mappedBundles = useMemo(() => {
    return bundles.map((bundle) => {
      const basePrice = Number(bundle.base_price) || 0;
      const discountPct = Number(bundle.discount_percentage) || 0;
      const finalPrice =
        bundle.discounted_price != null && bundle.discounted_price !== ''
          ? Number(bundle.discounted_price)
          : discountPct > 0
            ? basePrice * (1 - discountPct / 100)
            : basePrice;
      const savings = Math.max(0, basePrice - finalPrice);

      const includedIds = Array.isArray(bundle.included_products)
        ? bundle.included_products
        : [];
      const includedNames = includedIds
        .map((id) => productsById[id]?.name)
        .filter(Boolean);

      // Fall back to specification feature lists when no product names resolve
      const specs = bundle.specifications && typeof bundle.specifications === 'object'
        ? bundle.specifications
        : {};
      const specItems = [];
      if (Array.isArray(specs.includes)) {
        specItems.push(...specs.includes.filter(Boolean));
      } else if (Array.isArray(specs.items)) {
        specItems.push(...specs.items.filter(Boolean));
      } else if (Array.isArray(specs.features)) {
        specItems.push(...specs.features.filter(Boolean));
      }

      const items = includedNames.length > 0 ? includedNames : specItems;

      return {
        id: bundle.id,
        name: bundle.name,
        description: bundle.description || '',
        image: bundle.image_url || '',
        originalPrice: basePrice,
        bundlePrice: finalPrice,
        savings,
        discountPercentage: discountPct,
        items,
        specifications: specs,
        raw: bundle,
      };
    });
  }, [bundles, productsById]);

  const handleAddBundleToCart = (bundle) => {
    addToCart(
      {
        id: bundle.id,
        name: bundle.name,
        price: bundle.bundlePrice,
        base_price: bundle.originalPrice,
        image_url: bundle.image,
        short_description: bundle.description,
        category: 'Bundle',
        isBundle: true,
        items: bundle.items,
      },
      1
    );
    toast({
      title: 'Bundle Added! 🎁',
      description: `${bundle.name} has been added to your cart.`,
    });
  };

  if (loading) {
    return (
      <section className={`py-12 bg-muted/20 border-y border-border ${className}`}>
        <div className="container-premium flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </section>
    );
  }

  if (mappedBundles.length === 0) {
    return null;
  }

  return (
    <section className={`py-10 md:py-14 bg-muted/20 border-y border-border ${className}`}>
      <div className="container-premium">
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="h-6 w-6 text-accent" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{title}</h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {mappedBundles.map((bundle, index) => (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="premium-card overflow-hidden group flex flex-col bg-card border border-border/80 hover:shadow-lg transition-all duration-300"
            >
              {/* Image Container with robust aspect ratio & fallback */}
              <div 
                className="relative cursor-pointer"
                onClick={() => setSelectedBundle(bundle)}
              >
                <div className="w-full h-52 bg-white flex items-center justify-center p-3 overflow-hidden border-b">
                  {bundle.image ? (
                    <img
                      src={bundle.image}
                      alt={bundle.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fb = e.target.parentElement.querySelector('.bundle-fb');
                        if (fb) fb.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`bundle-fb ${bundle.image ? 'hidden' : 'flex'} w-full h-full flex-col items-center justify-center bg-muted/20 text-muted-foreground`}>
                    <Package className="h-12 w-12 text-muted-foreground/30 mb-1" />
                    <span className="text-[11px]">NextSens Bundle Kit</span>
                  </div>
                </div>

                {bundle.savings > 0 && (
                  <div className="absolute top-3 right-3 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-red-200">
                    <TrendingDown className="h-3 w-3" />
                    Save {formatPrice(bundle.savings)}
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                  CURATED BUNDLE
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 
                  className="text-base sm:text-lg font-bold text-foreground mb-1.5 cursor-pointer hover:text-accent transition-colors line-clamp-2"
                  onClick={() => setSelectedBundle(bundle)}
                >
                  {bundle.name}
                </h3>
                
                {bundle.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {bundle.description}
                  </p>
                )}

                {/* Included Items List */}
                {bundle.items.length > 0 && (
                  <div className="mb-4 bg-muted/30 p-2.5 rounded-lg border border-border/50 flex-1">
                    <p className="text-[11px] font-bold text-foreground mb-1.5 flex items-center justify-between">
                      <span>Package Includes ({bundle.items.length} items):</span>
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {bundle.items.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                      {bundle.items.length > 3 && (
                        <li 
                          onClick={() => setSelectedBundle(bundle)}
                          className="text-[11px] text-accent font-semibold pl-5 cursor-pointer hover:underline"
                        >
                          +{bundle.items.length - 3} more items — click to view
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Pricing & Actions */}
                <div className="mt-auto pt-3 border-t">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-xl sm:text-2xl font-black text-foreground">
                        {formatPrice(bundle.bundlePrice)}
                      </span>
                      {bundle.savings > 0 && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="line-through text-muted-foreground">
                            {formatPrice(bundle.originalPrice)}
                          </span>
                          <span className="text-emerald-600 font-bold">
                            {bundle.discountPercentage > 0
                              ? `${Math.round(bundle.discountPercentage)}% OFF`
                              : `${Math.round((bundle.savings / bundle.originalPrice) * 100)}% OFF`}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium text-right flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3 text-primary" />
                      18% GST ITC
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleAddBundleToCart(bundle)}
                      className="bg-accent hover:bg-primary text-white text-xs h-9 rounded-lg"
                      size="sm"
                    >
                      <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedBundle(bundle)}
                      className="text-xs h-9 rounded-lg border-border hover:bg-muted"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bundle Details Dialog */}
      <Dialog open={!!selectedBundle} onOpenChange={(open) => !open && setSelectedBundle(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBundle && (
            <>
              <DialogHeader>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent mb-1">
                  <Package className="h-4 w-4" />
                  <span>Curated Laboratory Package</span>
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  {selectedBundle.name}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {selectedBundle.description || 'Complete laboratory turnkey solution package'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid sm:grid-cols-2 gap-5 mt-3">
                <div className="relative rounded-xl overflow-hidden border border-border bg-white h-56 flex items-center justify-center p-3">
                  {selectedBundle.image ? (
                    <img
                      src={selectedBundle.image}
                      alt={selectedBundle.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                      <Package className="h-12 w-12 text-muted-foreground/30 mb-1" />
                      <span className="text-xs">NextSens Bundle Kit</span>
                    </div>
                  )}
                  {selectedBundle.savings > 0 && (
                    <div className="absolute top-3 right-3 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-red-200">
                      <TrendingDown className="h-3 w-3" />
                      Save {formatPrice(selectedBundle.savings)}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between">
                  <div className="bg-card border rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Package Pricing</p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                        {formatPrice(selectedBundle.bundlePrice)}
                      </span>
                      {selectedBundle.savings > 0 && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(selectedBundle.originalPrice)}
                        </span>
                      )}
                    </div>
                    {selectedBundle.savings > 0 && (
                      <p className="text-emerald-600 font-semibold text-xs">
                        Instant Savings: {formatPrice(selectedBundle.savings)}
                        {selectedBundle.discountPercentage > 0
                          ? ` (${Math.round(selectedBundle.discountPercentage)}% OFF)`
                          : ''}
                      </p>
                    )}
                    <div className="mt-3 pt-2 border-t text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      <span>18% GST Input Tax Credit (ITC) Invoice included</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-3">
                    <Button
                      onClick={() => {
                        handleAddBundleToCart(selectedBundle);
                        setSelectedBundle(null);
                      }}
                      className="w-full bg-accent hover:bg-primary text-white h-10 font-semibold text-xs rounded-lg"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add Complete Bundle to Cart
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full h-10 text-xs font-semibold rounded-lg border-border hover:bg-muted"
                    >
                      <Link to={`/contact?subject=Institutional Quote for ${encodeURIComponent(selectedBundle.name)}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Request University / Lab Quote
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {selectedBundle.items.length > 0 && (
                <div className="mt-4 bg-card border rounded-xl p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                    What's Included in This Bundle ({selectedBundle.items.length} Items):
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {selectedBundle.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded-md">
                        <Check className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span className="font-medium text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProductBundles;
