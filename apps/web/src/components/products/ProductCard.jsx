import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Eye, Tag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/use-toast';
import { getDiscountedPrice, getProductDiscountPercentage, toCartProduct } from '@/lib/pricing';

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // The discount is applied exactly once, here, using the admin-configured
    // discount percentage stored on the product.
    addToCart(toCartProduct(product), 1);
    toast({
      title: "Added to Cart! 🛒",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const formatPrice = (price, currency) => {
    if (price === null || price === undefined) return "Price on request";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getBestForLabel = (product) => {
    if (product.specifications?.applications && product.specifications.applications.length > 0) {
      return product.specifications.applications[0];
    }
    return 'General Laboratory';
  };

  const getKeySpecification = (product) => {
    if (product.specifications) {
      // Find the first spec that isn't 'applications'
      const specs = Object.entries(product.specifications).filter(([key]) => key !== 'applications');
      if (specs.length > 0) {
        const [key, value] = specs[0];
        return `${key.replace(/_/g, ' ')}: ${value}`;
      }
    }
    return product.features?.[0] || 'High-precision instrument';
  };

  const getProductTag = (name) => {
    if (['Advanced Potentiostat'].includes(name)) return { text: "Popular", color: "bg-orange-100 text-orange-800 border-orange-200" };
    if (['Combined pH Electrode', 'Ag/AgCl Reference Electrode', 'Calomel Reference Electrode'].includes(name)) return { text: "Lab Essential", color: "bg-green-100 text-green-800 border-green-200" };
    if (['Nafion N-117 PFSA Proton Exchange Membrane', 'Graphite Felt Sheet (100+1 mm)'].includes(name)) return { text: "Research Grade", color: "bg-purple-100 text-purple-800 border-purple-200" };
    return null;
  };

  const tag = getProductTag(product.name);
  const discount = getProductDiscountPercentage(product);
  const discountedPrice = getDiscountedPrice(product);
  const hasPrice = product.price !== null && product.price !== undefined && product.price !== '';
  const showDiscountBadge = hasPrice && discount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group h-full"
    >
      <div className="premium-card bg-card overflow-hidden h-full flex flex-col hover:-translate-y-1 smooth-transition rounded-xl relative">
        {/* Discount Badge — admin-configured discount_percentage */}
        {showDiscountBadge && (
          <div className="absolute top-0 right-0 z-20 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl shadow-sm flex items-center pointer-events-none">
            <Tag className="w-3 h-3 mr-1" />
            {discount}% OFF
          </div>
        )}

        <Link to={`/product/${product.id}`} className="relative block">
          <div className="relative h-64 overflow-hidden bg-white border-b border-border flex items-center justify-center p-4">
            <img
              src={product.image_url || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWRlZmVlIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K"}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 smooth-transition" />
          </div>
          
          {/* Tags layer */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {tag && (
              <div className={`${tag.color} border text-xs font-bold px-2.5 py-1 rounded-md shadow-sm w-fit`}>
                {tag.text}
              </div>
            )}
            <div className="bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm w-fit">
              Best for: {getBestForLabel(product)}
            </div>
          </div>
        </Link>

        <div className="p-5 flex-grow flex flex-col bg-card">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 hover:text-accent smooth-transition">
              {product.name}
            </h3>
          </Link>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.short_description || 'High-quality scientific instrument'}
          </p>

          <div className="text-xs text-muted-foreground mb-4 italic font-medium bg-muted/50 p-2 rounded border border-border">
            • {getKeySpecification(product)}
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex flex-col">
              {hasPrice ? (
                <>
                  {showDiscountBadge && (
                    <span className="text-sm text-muted-foreground line-through">
                      MRP: {formatPrice(product.price, product.currency)}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-foreground">
                    {formatPrice(discountedPrice, product.currency)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-foreground">Price on request</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="w-full bg-accent hover:bg-primary text-white"
                disabled={!hasPrice}
              >
                <ShoppingCart className="mr-1 h-4 w-4" />
                Add
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full border-border text-foreground hover:bg-muted"
              >
                <Link to={`/product/${product.id}`}>
                  <Eye className="mr-1 h-4 w-4" />
                  Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;