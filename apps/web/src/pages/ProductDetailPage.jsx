import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart, Loader2, ArrowLeft, Minus, Plus, XCircle, FileText, Youtube, MessageSquare as MessageSquareQuote, Phone, Tag } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { getDiscountedPrice, getProductDiscountPercentage, toCartProduct } from '@/lib/pricing';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWRlZmVlIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  let videoId;
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/watch?v=')) {
    videoId = new URL(url).searchParams.get('v');
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('/embed/')[1].split('?')[0];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toast } = useToast();
  const { addToCart } = useCart();

  const handleAddToCart = useCallback(() => {
    if (product) {
      // Discount applied exactly once, from the admin-configured percentage.
      addToCart(toCartProduct(product), quantity);
      toast({
        title: "Added to Cart! 🛒",
        description: `${quantity} x ${product.name} added to your cart.`,
      });
    }
  }, [product, quantity, addToCart, toast]);

  const handleQuantityChange = useCallback((amount) => {
    setQuantity((prevQuantity) => {
      const newQuantity = prevQuantity + amount;
      if (newQuantity < 1) return 1;
      return newQuantity;
    });
  }, []);

  const handleWhatsAppContact = () => {
    const message = `Hi, I'm interested in ${product.name}. Could you provide more information?`;
    const whatsappUrl = `https://wa.me/919321175585?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        setProduct(data);

        // Fetch related products (same category)
        if (data.category) {
          const { data: related } = await supabase
            .from('products')
            .select('*')
            .eq('category', data.category)
            .neq('id', id)
            .limit(4);

          setRelatedProducts(related || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] bg-background">
        <Loader2 className="h-16 w-16 text-accent animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Link to="/store" className="inline-flex items-center gap-2 text-accent hover:text-primary transition-colors mb-6">
          <ArrowLeft size={16} />
          Back to Store
        </Link>
        <div className="text-center text-red-600 p-8 bg-red-50 border border-red-100 rounded-2xl">
          <XCircle className="mx-auto h-16 w-16 mb-4" />
          <p className="mb-6">Error loading product: {error || 'Product not found.'}</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price, currency) => {
    if (price === null || price === undefined) return "Price on request";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(product.video_url);
  const isMp4Video = product.video_url && product.video_url.toLowerCase().endsWith('.mp4');
  const imageGallery = [product.image_url || placeholderImage];

  const primaryApplication = product.specifications?.applications?.[0];
  const discount = getProductDiscountPercentage(product);
  const discountedPrice = getDiscountedPrice(product);
  const savingsAmount = product.price !== null ? product.price - discountedPrice : null;

  return (
    <>
      <Helmet>
        <title>{product.name} | NextSens Tech Store</title>
        <meta name="description" content={product.short_description || product.name} />
      </Helmet>
      <div className="bg-background text-foreground min-h-screen">
        <div className="container-premium py-12">
          <Link to="/store" className="inline-flex items-center gap-2 text-accent hover:text-primary transition-colors mb-6 font-medium">
            <ArrowLeft size={16} />
            Back to Store
          </Link>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-xl shadow-sm border border-border h-96 md:h-[500px] mb-4 bg-white flex items-center justify-center p-8">
                <img
                  src={imageGallery[selectedImageIndex]}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
                {product.price !== null && product.price !== undefined && product.price !== '' && discount > 0 && (
                  <div className="absolute top-4 right-4 z-20 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center pointer-events-none">
                    <Tag className="w-4 h-4 mr-2" />
                    {discount}% OFF
                  </div>
                )}
              </div>
              {imageGallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {imageGallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all bg-white p-2 ${
                        selectedImageIndex === idx ? 'border-accent' : 'border-border'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col"
            >
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                  {product.category}
                </div>
                {primaryApplication && (
                  <div className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                    Best for: {primaryApplication}
                  </div>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-foreground mb-2">{product.name}</h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{product.short_description}</p>

              <div className="flex flex-col mb-6 pb-6 border-b border-border">
                {product.price !== null ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold text-foreground">{formatPrice(discountedPrice, product.currency)}</span>
                      {discount > 0 && (
                        <span className="text-xl text-muted-foreground line-through font-medium">MRP: {formatPrice(product.price, product.currency)}</span>
                      )}
                    </div>
                    {discount > 0 && (
                      <span className="text-green-600 font-semibold mt-1">You save {formatPrice(savingsAmount, product.currency)} ({discount}%)</span>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-bold text-foreground">Price on request</span>
                )}
              </div>

              {/* Applications Section */}
              {(product.features && product.features.length > 0) && (
                <div className="mb-6 premium-card p-5 bg-card">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Applications & Features</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-accent mr-2 mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technical Specifications Table */}
              {product.specifications && (
                <div className="mb-6 premium-card p-5 bg-card">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Technical Specifications</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-border">
                        {Object.entries(product.specifications).filter(([key]) => key !== 'applications').map(([key, value]) => (
                          <tr key={key} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 pr-4 font-medium text-foreground capitalize w-1/3">
                              {key.replace(/_/g, ' ')}
                            </td>
                            <td className="py-3 text-muted-foreground">{String(value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-semibold text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-md">
                  <Button
                    onClick={() => handleQuantityChange(-1)}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-foreground hover:bg-muted rounded-none rounded-l-md"
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-12 text-center text-foreground font-semibold">{quantity}</span>
                  <Button
                    onClick={() => handleQuantityChange(1)}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-foreground hover:bg-muted rounded-none rounded-r-md"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto space-y-3">
                <Button onClick={handleAddToCart} size="lg" className="w-full py-6 text-lg bg-accent hover:bg-primary text-white shadow-md hover:shadow-lg transition-all" disabled={product.price === null}>
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full py-6 text-lg border-border text-foreground hover:bg-muted">
                  <Link to={`/request-quote/${product.id}`}>
                    <MessageSquareQuote className="mr-2 h-5 w-5" /> Request Quote for Bulk Order
                  </Link>
                </Button>
                <Button onClick={handleWhatsAppContact} variant="outline" size="lg" className="w-full py-6 text-lg bg-[#F0FDF4] hover:bg-[#DCFCE7] border-[#22C55E] text-[#166534] transition-colors">
                  <Phone className="mr-2 h-5 w-5" /> Contact via WhatsApp
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Download & Video Section */}
          {(product.pdf_url || youtubeEmbedUrl || isMp4Video) && (
            <div className="mt-16 grid md:grid-cols-2 gap-8">
              {product.pdf_url && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="premium-card p-6 bg-card"
                >
                  <h3 className="text-2xl font-bold mb-4 flex items-center text-foreground">
                    <FileText className="mr-3 text-accent" />
                    Product Datasheet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Download detailed technical documentation, user manuals, and complete specifications.
                  </p>
                  <Button asChild variant="outline" size="lg" className="w-full border-accent text-accent hover:bg-accent hover:text-white transition-colors">
                    <a href={product.pdf_url} target="_blank" rel="noopener noreferrer" download>
                      <FileText className="mr-2 h-5 w-5" />
                      Download PDF Datasheet
                    </a>
                  </Button>
                </motion.div>
              )}
              {(youtubeEmbedUrl || isMp4Video) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="premium-card p-6 bg-card"
                >
                  <h3 className="text-2xl font-bold mb-4 flex items-center text-foreground">
                    <Youtube className="mr-3 text-red-600" />
                    Product Video
                  </h3>
                  <div className="aspect-video rounded-lg overflow-hidden border border-border shadow-sm">
                    {youtubeEmbedUrl ? (
                      <iframe
                        src={youtubeEmbedUrl}
                        title={product.name}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    ) : (
                      <video controls className="w-full h-full bg-black">
                        <source src={product.video_url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-20 pt-10 border-t border-border"
            >
              <h2 className="text-3xl font-bold text-foreground mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct, index) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductDetailPage;