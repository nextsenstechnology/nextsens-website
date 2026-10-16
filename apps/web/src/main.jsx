import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { AuthProvider } from '@/contexts/SupabaseAuthContext.jsx';
import { CartProvider } from '@/hooks/useCart';

const AppWrapper = () => {
  return (
    <>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<AppWrapper />);