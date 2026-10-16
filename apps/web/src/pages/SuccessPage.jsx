import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      navigate(`/order-confirmation/${orderId}`, { replace: true });
    }
  }, [orderId, navigate]);

  return (
    <>
      <Helmet>
        <title>Order Successful! | NextSens Tech</title>
        <meta name="description" content="Your order has been placed successfully." />
      </Helmet>
      <div className="flex items-center justify-center min-h-[60vh] bg-background text-foreground">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 max-w-lg mx-auto bg-card rounded-2xl shadow-2xl border"
        >
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl font-extrabold text-foreground mb-4">
            Thank You for Your Order!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your payment was successful and your order is being processed. You will receive a confirmation email shortly.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/store">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SuccessPage;