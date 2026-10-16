import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import StorePage from '@/pages/StorePage';
import ProductsPage from '@/pages/ProductsPage';
import CategoryPage from '@/pages/CategoryPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import SuccessPage from '@/pages/SuccessPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminSetupPage from '@/pages/admin/AdminSetupPage';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import QuoteRequestPage from '@/pages/QuoteRequestPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import { CartProvider } from '@/hooks/useCart';

function App() {
  return (
    <CartProvider>
      <Router future={{ v7_startTransition: true }}>
        <Routes>
          <Route path="/nst-admin/setup" element={<AdminSetupPage />} />
          <Route path="/nst-admin/login" element={<AdminLoginPage />} />
          <Route 
            path="/nst-admin" 
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="store" element={<StorePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:category" element={<CategoryPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="request-quote/:id" element={<QuoteRequestPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-confirmation/:order_id" element={<OrderConfirmationPage />} />
            <Route path="success" element={<SuccessPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </CartProvider>
  );
}

export default App;