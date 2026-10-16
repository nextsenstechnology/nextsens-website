import { useState, useEffect } from 'react';

export const useRazorpayScript = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (window.Razorpay) {
      console.log('Razorpay script already loaded.');
      setIsLoaded(true);
      return;
    }

    const scriptId = 'razorpay-checkout-script';
    if (document.getElementById(scriptId)) {
      console.log('Razorpay script is already injecting.');
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      setIsLoaded(true);
    };

    script.onerror = (err) => {
      console.error('Failed to load Razorpay script', err);
      setError(true);
    };

    document.body.appendChild(script);

    return () => {
      // Do not remove script on unmount to keep it cached
    };
  }, []);

  return { isLoaded, error };
};