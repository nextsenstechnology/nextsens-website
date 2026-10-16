import React, { useState, useMemo, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useCart } from '@/hooks/useCart';

const Header = ({ onCartClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const totalItems = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  // Secret shortcut: Press Ctrl + Shift + A (or Cmd + Shift + A) anywhere on the website to open admin login
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/nst-admin/login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const activeLinkStyle = {
    color: 'hsl(var(--accent))',
    fontWeight: '600'
  };

  return (
    <header className="bg-background/95 backdrop-blur-lg shadow-sm sticky top-0 z-40 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT SIDE: Logo ONLY */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-lg shadow-md group-hover:shadow-lg transition-all">
              <span className="text-white font-bold text-xl">NST</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold transition-colors tracking-tight" style={{ color: '#D4AF37' }}>
                NEXTSENS TECHNOLOGY
              </span>
              <span className="text-xs font-medium" style={{ color: '#D4AF37' }}>
                Sensing Tomorrow, Today
              </span>
            </div>
          </Link>

          {/* RIGHT SIDE: Navigation & Actions (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  cn(
                    navigationMenuTriggerStyle(),
                    isActive ? "text-accent font-semibold" : "text-foreground",
                    "hover:text-accent transition-colors duration-300 font-medium bg-transparent"
                  )
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/store"
                className={({ isActive }) =>
                  cn(
                    navigationMenuTriggerStyle(),
                    isActive ? "text-accent font-semibold" : "text-foreground",
                    "hover:text-accent transition-colors duration-300 font-medium bg-transparent"
                  )
                }
              >
                Store
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  cn(
                    navigationMenuTriggerStyle(),
                    isActive ? "text-accent font-semibold" : "text-foreground",
                    "hover:text-accent transition-colors duration-300 font-medium bg-transparent"
                  )
                }
              >
                About Us
              </NavLink>
              
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  cn(
                    navigationMenuTriggerStyle(),
                    isActive ? "text-accent font-semibold" : "text-foreground",
                    "hover:text-accent transition-colors duration-300 font-medium bg-transparent"
                  )
                }
              >
                Contact
              </NavLink>
            </nav>

            <div className="flex items-center gap-3 border-l border-border pl-6">
              <Button onClick={onCartClick} variant="ghost" size="icon" className="relative hover:text-accent transition-colors">
                <ShoppingCartIcon className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </Button>
              <Button asChild size="sm" className="rounded-md shadow-sm hover:bg-accent transition-colors">
                <Link to="/store">Shop Now</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-md border-border text-foreground hover:bg-muted transition-colors">
                <Link to="/contact">Request a Quote</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <Button onClick={onCartClick} variant="ghost" size="icon" className="relative hover:text-accent transition-colors">
              <ShoppingCartIcon className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background shadow-lg absolute w-full border-t border-border overflow-hidden"
          >
            <nav className="flex flex-col items-center space-y-4 p-6">
              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-foreground hover:text-accent font-medium text-lg w-full text-center py-2"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                Home
              </NavLink>
              <NavLink
                to="/store"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-foreground hover:text-accent font-medium text-lg w-full text-center py-2"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                Store
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-foreground hover:text-accent font-medium text-lg w-full text-center py-2"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                About Us
              </NavLink>
              <NavLink
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-foreground hover:text-accent font-medium text-lg w-full text-center py-2"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                Contact
              </NavLink>
              
              <div className="w-full pt-6 border-t border-border flex flex-col space-y-3">
                <Button asChild className="w-full rounded-md hover:bg-accent py-6 text-lg">
                  <Link to="/store" onClick={() => setIsMobileMenuOpen(false)}>
                    Shop Now
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-md border-border text-foreground hover:bg-muted py-6 text-lg">
                  <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                    Request a Quote
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;