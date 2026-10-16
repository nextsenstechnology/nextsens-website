import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart as ShoppingCartIcon, X, Loader2, Mail, Phone, MessageSquare } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';

const ShoppingCart = ({ isCartOpen, setIsCartOpen }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartSubtotal, getTaxAmount, getCartTotal, TAX_RATE } = useCart();

  const handleProceedToCheckout = () => {
      setIsCartOpen(false);
      navigate('/checkout');
  };

  const formatPrice = (price) => {
    const numericPrice = typeof price === 'number' ? price : 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(numericPrice);
  };
  
  const subtotal = getCartSubtotal;
  const taxAmount = getTaxAmount;
  const total = getCartTotal;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50"
          onClick={() => setIsCartOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">Shopping Cart</h2>
              <Button onClick={() => setIsCartOpen(false)} variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
                <X />
              </Button>
            </div>
            <div className="flex-grow p-6 overflow-y-auto space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                  <ShoppingCartIcon size={48} className="mb-4" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.product.id} className="flex items-start gap-4">
                    <img
                        src={item.product.image_url || item.product.image || 'https://via.placeholder.com/80'}
                        alt={item.product.name || item.product.title}
                        className="w-20 h-20 object-cover rounded-md border"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-foreground">{item.product.name || item.product.title}</h3>
                      {item.product.isBundle && item.product.items?.length > 0 && (
                        <div className="mt-1 mb-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Includes ({item.product.items.length} items):
                          </p>
                          <ul className="text-xs text-muted-foreground/80 space-y-0.5 mt-0.5">
                            {item.product.items.map((inc, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-accent">•</span>
                                <span className="line-clamp-1">{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-sm text-primary font-bold mt-1">
                        {formatPrice(item.product.price || (item.product.price_in_cents / 100))}
                      </p>
                      <div className="flex items-center border rounded-md mt-2 w-fit">
                        <Button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} size="sm" variant="ghost" className="px-2 h-7">-</Button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <Button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} size="sm" variant="ghost" className="px-2 h-7">+</Button>
                      </div>
                    </div>
                    <Button onClick={() => removeFromCart(item.product.id)} size="icon" variant="ghost" className="text-destructive hover:text-destructive h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border">
                <div className="space-y-2 mb-4">
                  <p className="text-center text-muted-foreground text-sm mb-3">Need help? Contact us!</p>
                  <div className="flex justify-center items-center gap-4">
                    <a href="https://api.whatsapp.com/send?phone=+919321175585&text=Hello," target="_blank" rel="noopener noreferrer" className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
                      <MessageSquare size={20} />
                    </a>
                    <Link to="/contact" onClick={() => setIsCartOpen(false)} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="M12 18a10 10 0 0 0 5-8.5 10 10 0 0 0-10 0A10 10 0 0 0 12 18Z"/><path d="M2 12h20"/></svg>
                    </Link>
                    <a href="mailto:nextsenstechnology@gmail.com" className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                      <Mail size={20} />
                    </a>
                    <a href="tel:+919321175585" className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition-colors">
                      <Phone size={20} />
                    </a>
                  </div>
                </div>
                
                <div className="space-y-2 py-4 border-t border-b mb-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax @{TAX_RATE * 100}%</span>
                    <span>{formatPrice(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-foreground">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Button onClick={handleProceedToCheckout} size="lg" className="w-full text-base bg-accent hover:bg-primary text-white">
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShoppingCart;