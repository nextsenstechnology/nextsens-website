import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, TrendingDown, Loader2, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useCart } from '@/hooks/useCart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const ProductBundles = () => {
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
          supabase.from('products').select('id, name'),
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
      <section className="py-16 bg-muted/30 border-y border-border">
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
    <section className="py-16 bg-muted/30 border-y border-border">
      <div className="container-premium">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Package className="h-8 w-8 text-accent" />
            <h2 className="text-3xl font-bold text-foreground">Equipment Bundles</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Save more with our curated instrument packages designed for complete laboratory solutions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mappedBundles.map((bundle, index) => (
            <motion.div
              key={bundle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="premium-card overflow-hidden group hover:-translate-y-1 smooth-transition cursor-pointer"
              onClick={() => setSelectedBundle(bundle)}
            >
              <div className="relative">
                {bundle.image ? (
                  <img
                    src={bundle.image}
                    alt={bundle.name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                )}
                {bundle.savings > 0 && (
                  <div className="absolute top-3 right-3 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-red-200">
                    <TrendingDown className="h-3 w-3" />
                    Save {formatPrice(bundle.savings)}
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  BUNDLE
                </div>
              </div>

              <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {bundle.name}
                </h3>
                {bundle.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {bundle.description}
                  </p>
                )}

                {bundle.items.length > 0 && (
                  <div className="mb-4 flex-grow">
                    <p className="text-xs font-semibold text-foreground mb-2">
                      Includes ({bundle.items.length} items):
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {bundle.items.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-accent">•</span>
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                      {bundle.items.length > 3 && (
                        <li className="text-accent font-medium pl-3">
                          +{bundle.items.length - 3} more — click to view all
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="mt-auto">
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-foreground">
                        {formatPrice(bundle.bundlePrice)}
                      </span>
                    </div>
                    {bundle.savings > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="line-through text-muted-foreground">
                          {formatPrice(bundle.originalPrice)}
                        </span>
                        <span className="text-red-600 font-semibold">
                          {bundle.discountPercentage > 0
                            ? `${Math.round(bundle.discountPercentage)}% OFF`
                            : `${Math.round((bundle.savings / bundle.originalPrice) * 100)}% OFF`}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddBundleToCart(bundle);
                    }}
                    className="w-full bg-accent hover:bg-primary text-white"
                    size="sm"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add Bundle
                  </Button>
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
                <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Package className="h-6 w-6 text-accent" />
                  {selectedBundle.name}
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  {selectedBundle.description || 'Complete laboratory solution package'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid sm:grid-cols-2 gap-6 mt-2">
                <div className="relative rounded-xl overflow-hidden border border-border bg-muted h-56">
                  {selectedBundle.image ? (
                    <img
                      src={selectedBundle.image}
                      alt={selectedBundle.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    BUNDLE
                  </div>
                  {selectedBundle.savings > 0 && (
                    <div className="absolute top-3 right-3 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-red-200">
                      <TrendingDown className="h-3 w-3" />
                      Save {formatPrice(selectedBundle.savings)}
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="premium-card p-4 bg-card mb-4">
                    <p className="text-sm font-semibold text-foreground mb-3">Package Pricing</p>
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-3xl font-bold text-foreground">
                        {formatPrice(selectedBundle.bundlePrice)}
                      </span>
                      {selectedBundle.savings > 0 && (
                        <span className="text-lg text-muted-foreground line-through">
                          {formatPrice(selectedBundle.originalPrice)}
                        </span>
                      )}
                    </div>
                    {selectedBundle.savings > 0 && (
                      <p className="text-green-600 font-semibold text-sm">
                        You save {formatPrice(selectedBundle.savings)}
                        {selectedBundle.discountPercentage > 0
                          ? ` (${Math.round(selectedBundle.discountPercentage)}% OFF)`
                          : ''}
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      handleAddBundleToCart(selectedBundle);
                      setSelectedBundle(null);
                    }}
                    className="w-full bg-accent hover:bg-primary text-white"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add Bundle to Cart
                  </Button>
                </div>
              </div>

              {selectedBundle.items.length > 0 && (
                <div className="mt-4 premium-card p-5 bg-card">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    What's included in this bundle ({selectedBundle.items.length} items):
                  </p>
                  <ul className="space-y-2">
                    {selectedBundle.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
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
