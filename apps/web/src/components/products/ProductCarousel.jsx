import React, { useState, useEffect, useRef } from 'react';
    import Autoplay from "embla-carousel-autoplay";
    import { Link } from 'react-router-dom';
    import {
      Carousel,
      CarouselContent,
      CarouselItem,
      CarouselNext,
      CarouselPrevious,
    } from "@/components/ui/carousel";
    import { Card, CardContent } from "@/components/ui/card";
    import { supabase } from '@/lib/customSupabaseClient';
    import { Loader2, ShoppingCart, List, Zap, Tag } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useCart } from '@/hooks/useCart';
    import { useToast } from '@/components/ui/use-toast';
    import { getDiscountedPrice, getProductDiscountPercentage, toCartProduct } from '@/lib/pricing';

    const ProductCarouselCard = ({ product }) => {
        const { addToCart } = useCart();
        const { toast } = useToast();

        const formatPrice = (price, currency) => {
            if (price === null || price === undefined) return "Price on request";
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currency || 'INR',
            }).format(price);
        };
        
        const handleAddToCart = (e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(toCartProduct(product), 1);
            toast({
                title: "Added to Cart! 🛒",
                description: `${product.name} has been added to your cart.`,
            });
        };

        const features = product.features?.slice(0, 2) || [];
        const specifications = product.specifications ? Object.entries(product.specifications).slice(0, 2) : [];
        const discount = getProductDiscountPercentage(product);
        const hasPrice = product.price !== null && product.price !== undefined && product.price !== '';
        const showDiscountBadge = hasPrice && discount > 0;

      return (
        <Card className="h-full flex flex-col group border overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 relative">
          {showDiscountBadge && (
            <div className="absolute top-0 right-0 z-20 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl shadow-sm flex items-center pointer-events-none">
              <Tag className="w-3 h-3 mr-1" />
              {discount}% OFF
            </div>
          )}
          <Link to={`/product/${product.id}`} className="flex flex-col h-full">
            <div className="h-64 overflow-hidden relative bg-gray-100">
                <img className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" alt={product.name} src={product.image_url} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <h3 className="absolute bottom-0 left-0 p-4 text-xl font-bold text-white">{product.name}</h3>
            </div>
            <CardContent className="p-4 flex-grow flex flex-col">
                <p className="text-muted-foreground text-sm mb-3">{product.short_description}</p>
                
                {features.length > 0 && (
                    <div className="mb-3">
                        <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center"><Zap className="h-4 w-4 mr-2 text-primary"/>Features</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {features.map((feature, index) => <li key={index}>{feature}</li>)}
                        </ul>
                    </div>
                )}

                {specifications.length > 0 && (
                     <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center"><List className="h-4 w-4 mr-2 text-primary"/>Key Specs</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            {specifications.map(([key, value]) => (
                                <li key={key} className="flex justify-between">
                                    <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                                    <span>{value}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <div className="mt-auto">
                    <div className="text-2xl font-bold text-primary mb-4">{formatPrice(getDiscountedPrice(product), product.currency)}</div>
                    <Button onClick={handleAddToCart} className="w-full" disabled={product.price === null}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                </div>
            </CardContent>
          </Link>
        </Card>
      );
    };

    const ProductCarousel = () => {
      const [products, setProducts] = useState([]);
      const [loading, setLoading] = useState(true);
      const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));

      useEffect(() => {
        const fetchProducts = async () => {
          setLoading(true);
          const { data, error } = await supabase.from('products').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false });
          if (error) {
            console.error('Error fetching products for carousel:', error);
          } else {
            setProducts(data);
          }
          setLoading(false);
        };
        fetchProducts();
      }, []);

      if (loading) {
        return (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
      }

      if (products.length === 0) {
        return null;
      }

      return (
        <>
          <Carousel
            plugins={[plugin.current]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 p-4">
                  <ProductCarouselCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </>
      );
    };

    export default ProductCarousel;