import React, { useState, useMemo, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart as ShoppingCartIcon, Phone, Mail } from 'lucide-react';
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
      {/* Top Announcement & Trust Bar */}
      <div className="bg-[#0F172A] text-slate-300 text-xs py-1 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-2.5 text-[10px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ISO Calibration Standard
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:inline text-slate-300">Pan-India Dispatch</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="text-amber-400 font-semibold">18% GST ITC Invoices</span>
          </div>
          <div className="flex items-center gap-2.5 text-[10px] sm:text-xs">
            <a 
              href="tel:+919321175585" 
              className="flex items-center gap-1 text-slate-200 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>+91-9321175585</span>
            </a>
            <span className="text-slate-600">|</span>
            <a 
              href="mailto:sales@nextsenstech.com" 
              className="hidden lg:flex items-center gap-1 text-slate-200 hover:text-white transition-colors"
            >
              <Mail className="w-3 h-3 text-sky-400" />
              <span>sales@nextsenstech.com</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
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
                to="/bundles"
                className={({ isActive }) =>
                  cn(
                    navigationMenuTriggerStyle(),
                    isActive ? "text-accent font-semibold" : "text-foreground",
                    "hover:text-accent transition-colors duration-300 font-medium bg-transparent flex items-center gap-1.5"
                  )
                }
              >
                <span>Equipment Bundles</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Save
                </span>
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
                to="/bundles"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-foreground hover:text-accent font-medium text-lg w-full text-center py-2 flex items-center justify-center gap-2"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                <span>Equipment Bundles</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Save
                </span>
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