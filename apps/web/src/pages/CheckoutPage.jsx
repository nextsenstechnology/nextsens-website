import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, CheckCircle, Mail, Info } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useRazorpayScript } from '@/hooks/useRazorpayScript';
import { motion } from 'framer-motion';


const CheckoutPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, clearCart } = useCart();
  const { isLoaded: isRazorpayLoaded, error: razorpayScriptError } = useRazorpayScript();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    email: '',
    mobile: '',
    gst_number: '',
    billing_address: '',
    billing_city: '',
    billing_state: '',
    billing_pincode: '',
    sameAsBilling: true,
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_pincode: ''
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    if (razorpayScriptError) {
      toast({
        variant: "destructive",
        title: "Script Load Error",
        description: "Payment gateway not available. Please check your internet connection and try again.",
      });
    }
  }, [razorpayScriptError, toast]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const nextStep = () => {
      if (step === 1 && (!formData.customer_name || !formData.email || !formData.mobile)) {
          toast({ variant: "destructive", title: "Missing Fields", description: "Please fill all required personal fields." });
          return;
      }
      if (step === 3 && (!formData.billing_address || !formData.billing_city || !formData.billing_state || !formData.billing_pincode)) {
          toast({ variant: "destructive", title: "Missing Fields", description: "Please fill all billing address fields." });
          return;
      }
      if (step === 4 && !formData.sameAsBilling && (!formData.shipping_address || !formData.shipping_city || !formData.shipping_state || !formData.shipping_pincode)) {
          toast({ variant: "destructive", title: "Missing Fields", description: "Please fill all shipping address fields." });
          return;
      }
      setStep(prev => Math.min(prev + 1, 5));
  }
  
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  // Calculations
  // Cart item prices already include the admin-configured product discount
  // (applied once when the item was added to the cart). Do NOT discount again.
  const baseSum = cartItems.reduce((total, item) => total + ((item.product.price || 0) * item.quantity), 0);
  const subtotal = baseSum;
  const gstAmount = subtotal * 0.18; 
  const totalAmount = subtotal + gstAmount;
  const totalDiscountAmount = cartItems.reduce((total, item) => {
    const mrp = item.product.base_price ?? item.product.price ?? 0;
    const selling = item.product.price ?? 0;
    const lineDiscount = Math.max(0, (mrp - selling) * item.quantity);
    return total + lineDiscount;
  }, 0);

  // State-based GST Logic
  const isMaharashtra = formData.billing_state?.trim().toLowerCase() === 'maharashtra';
  const taxType = isMaharashtra ? 'CGST_SGST' : 'IGST';
  const cgstAmount = isMaharashtra ? gstAmount / 2 : 0;
  const sgstAmount = isMaharashtra ? gstAmount / 2 : 0;
  const igstAmount = isMaharashtra ? 0 : gstAmount;

  const handlePaymentSuccess = async (response, orderDataPayload) => {
    setLoadingText("Verifying payment & generating invoice...");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { 
            razorpay_order_id: response.razorpay_order_id, 
            razorpay_payment_id: response.razorpay_payment_id, 
            razorpay_signature: response.razorpay_signature,
            order_data: orderDataPayload
        }
      });

      if (error || !data?.success) {
          throw new Error(data?.error || error?.message || 'Payment verification failed on server.');
      }

      toast({ title: "Payment successful!", description: "Your order has been placed successfully." });
      
      if (!data.emailsSent) {
          toast({ 
              variant: "default", 
              title: "Order Placed", 
              description: "Payment complete, but there was a slight delay sending your confirmation email. We'll try again shortly." 
          });
      }
      
      clearCart();
      setSuccessData(data);
      
    } catch (error) {
      console.error("Payment verification error:", error);
      setErrorMsg("Payment verification failed. Please contact support if amount was deducted.");
      toast({ variant: "destructive", title: "Verification Failed", description: error.message });
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setLoadingText("Creating secure order...");
    setErrorMsg('');
    
    try {
      if (!isRazorpayLoaded) throw new Error("Payment gateway not available. Please try again.");

      const orderDataPayload = {
        customer_name: formData.customer_name,
        company_name: formData.company_name,
        email: formData.email,
        mobile: formData.mobile,
        gst_number: formData.gst_number,
        gst_applicable: true,
        billing_address: {
            line: formData.billing_address, city: formData.billing_city, state: formData.billing_state, pincode: formData.billing_pincode
        },
        shipping_address: formData.sameAsBilling ? {
            line: formData.billing_address, city: formData.billing_city, state: formData.billing_state, pincode: formData.billing_pincode
        } : {
            line: formData.shipping_address, city: formData.shipping_city, state: formData.shipping_state, pincode: formData.shipping_pincode
        },
        items: cartItems.map(i => ({ name: i.product.name || i.product.title, quantity: i.quantity, price: i.product.price, mrp: i.product.base_price ?? i.product.price, hsn: '9027', isBundle: !!i.product.isBundle, included_items: i.product.items || [] })),
        subtotal: subtotal,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        customer_state: formData.billing_state,
        tax_type: taxType,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        igst_amount: igstAmount
      };

      const amountInPaise = Math.round(totalAmount * 100);

      const { data: rzpData, error: rzpError } = await supabase.functions.invoke('create-razorpay-order', {
          body: {
              amount: amountInPaise,
              currency: 'INR',
              customer_email: formData.email,
              customer_name: formData.customer_name,
              order_data: orderDataPayload
          }
      });

      if (rzpError || !rzpData?.razorpay_order_id) {
          throw new Error("Failed to create secure order. Please try again.");
      }

      setLoadingText("Opening payment gateway...");

      const rzpKey = rzpData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!rzpKey) throw new Error("Razorpay configuration missing.");

      const options = {
          key: rzpKey,
          amount: amountInPaise,
          currency: "INR",
          name: "NEXTSENS TECHNOLOGY",
          description: "Product Purchase",
          order_id: rzpData.razorpay_order_id,
          handler: async function (response) {
              await handlePaymentSuccess(response, orderDataPayload);
          },
          prefill: { name: formData.customer_name, email: formData.email, contact: formData.mobile },
          theme: { color: "#ea580c" },
          modal: {
              ondismiss: function() {
                  setLoading(false); setLoadingText('');
                  setErrorMsg("Payment was cancelled.");
              }
          }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
          setLoading(false); setLoadingText('');
          setErrorMsg("Payment failed. Please try again.");
          toast({ variant: "destructive", title: "Payment Failed", description: response.error.description });
      });
      rzp.open();

    } catch (error) {
      setErrorMsg(error.message || "An unexpected error occurred during checkout.");
      setLoading(false);
      setLoadingText('');
    }
  };

  if (successData) {
      return (
          <div className="min-h-[70vh] bg-muted/20 py-12 px-4 flex items-center justify-center">
            <Helmet><title>Order Successful | NextSens Tech</title></Helmet>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
                <Card className="border-green-200 shadow-xl overflow-hidden">
                    <div className="bg-green-50 p-6 flex flex-col items-center justify-center text-center border-b border-green-100">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-green-800">Order Confirmed!</h2>
                        <p className="text-green-600 mt-2">Thank you for your purchase.</p>
                    </div>
                    <CardContent className="p-6 space-y-4 bg-card">
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-muted-foreground">Order ID</span>
                            <span className="font-semibold">{successData.order_id}</span>
                        </div>
                        {successData.invoice_number && (
                            <div className="flex justify-between items-center text-sm border-b pb-2">
                                <span className="text-muted-foreground">Invoice No.</span>
                                <span className="font-semibold text-primary">{successData.invoice_number}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-sm border-b pb-2">
                            <span className="text-muted-foreground">Total Paid</span>
                            <span className="font-bold">₹{totalAmount.toFixed(2)}</span>
                        </div>
                        
                        <div className="space-y-2 mt-4">
                            {successData.emailsSent ? (
                                <>
                                    <div className="flex items-start gap-2 bg-blue-50 text-blue-800 p-3 rounded text-sm">
                                        <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>Order confirmation email sent to <strong>{successData.customer_email || formData.email}</strong></span>
                                    </div>
                                    <div className="flex items-start gap-2 bg-blue-50 text-blue-800 p-3 rounded text-sm">
                                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <span>Admin notification sent to <strong>nextsenstechnology@gmail.com</strong></span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-start gap-2 bg-amber-50 text-amber-800 p-3 rounded text-sm">
                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>Payment was successful, but there was an issue sending the confirmation email. Your order is confirmed and being processed.</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button onClick={() => navigate(`/order-confirmation/${successData.order_id}`)} className="w-full">
                                View Order Details
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                                Return to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
          </div>
      )
  }

  if (cartItems.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <Button onClick={() => navigate('/store')}>Continue Shopping</Button>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet><title>Checkout | NextSens Tech</title></Helmet>
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-border">
          <CardHeader className="bg-card border-b border-border pb-6">
            <CardTitle className="text-2xl font-bold text-foreground">Checkout - Step {step} of 5</CardTitle>
            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`h-2 flex-1 rounded-full ${step >= s ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {errorMsg && (
                <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-md flex items-center gap-3 border border-destructive/20">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{errorMsg}</p>
                </div>
            )}

            <div className={step === 1 ? 'block' : 'hidden'}>
              <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Full Name *</Label>
                  <Input id="customer_name" placeholder="John Doe" value={formData.customer_name} onChange={handleInputChange} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company / University (Optional)</Label>
                  <Input id="company_name" placeholder="ABC Corp" value={formData.company_name} onChange={handleInputChange} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleInputChange} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input id="mobile" type="tel" placeholder="+91 9876543210" value={formData.mobile} onChange={handleInputChange} disabled={loading} />
                </div>
              </div>
            </div>
            
            <div className={step === 2 ? 'block' : 'hidden'}>
              <h3 className="text-lg font-semibold mb-4">Tax Information</h3>
              <div className="space-y-5">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-4">
                  <p className="text-sm text-primary font-medium">18% GST is applied to all orders.</p>
                  <p className="text-sm text-muted-foreground mt-1">Provide GST number for B2B invoice allowing input tax credit claim.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst_number">GST Number (Optional)</Label>
                  <Input id="gst_number" placeholder="22AAAAA0000A1Z5" value={formData.gst_number} onChange={handleInputChange} disabled={loading} className="uppercase" />
                </div>
              </div>
            </div>

            <div className={step === 3 ? 'block' : 'hidden'}>
              <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="billing_address">Address Line *</Label>
                  <Input id="billing_address" placeholder="123 Tech Park" value={formData.billing_address} onChange={handleInputChange} disabled={loading} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="billing_city">City *</Label>
                    <Input id="billing_city" placeholder="Mumbai" value={formData.billing_city} onChange={handleInputChange} disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing_state">State *</Label>
                    <Input id="billing_state" placeholder="Maharashtra" value={formData.billing_state} onChange={handleInputChange} disabled={loading} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_pincode">Pincode *</Label>
                  <Input id="billing_pincode" placeholder="400001" value={formData.billing_pincode} onChange={handleInputChange} disabled={loading} className="w-full md:w-1/2" />
                </div>
              </div>
            </div>

            <div className={step === 4 ? 'block' : 'hidden'}>
              <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
              <div className="space-y-5">
                <div className="flex items-center space-x-3 p-4 border rounded-lg bg-card">
                  <Checkbox id="sameAsBilling" checked={formData.sameAsBilling} onCheckedChange={(c) => setFormData(p => ({...p, sameAsBilling: !!c}))} disabled={loading} />
                  <Label htmlFor="sameAsBilling" className="cursor-pointer font-medium">My shipping address is the same as my billing address</Label>
                </div>
                
                {!formData.sameAsBilling && (
                  <div className="pt-4 space-y-5 border-t mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="shipping_address">Address Line *</Label>
                      <Input id="shipping_address" value={formData.shipping_address} onChange={handleInputChange} disabled={loading} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="shipping_city">City *</Label>
                        <Input id="shipping_city" value={formData.shipping_city} onChange={handleInputChange} disabled={loading} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shipping_state">State *</Label>
                        <Input id="shipping_state" value={formData.shipping_state} onChange={handleInputChange} disabled={loading} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping_pincode">Pincode *</Label>
                      <Input id="shipping_pincode" value={formData.shipping_pincode} onChange={handleInputChange} disabled={loading} className="w-full md:w-1/2" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={step === 5 ? 'block' : 'hidden'}>
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="bg-card border rounded-lg p-5 space-y-4">
                <div className="space-y-3 border-b pb-4">
                    {cartItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-sm">
                            <div className="pr-4">
                                <span className="font-medium">{item.product.name || item.product.title} <span className="text-muted-foreground">(x{item.quantity})</span></span>
                                {item.product.isBundle && item.product.items?.length > 0 && (
                                    <ul className="mt-1 text-xs text-muted-foreground space-y-0.5">
                                        {item.product.items.map((inc, i) => (
                                            <li key={i} className="flex items-start gap-1">
                                                <span className="text-accent">•</span>
                                                <span>{inc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <span className="whitespace-nowrap">₹{((item.product.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="space-y-2 pt-2 border-b pb-4">
                  {totalDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Discount</span>
                      <span className="font-medium text-green-600">(-) {totalDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Taxable Value (after product discount)</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {taxType === 'CGST_SGST' ? (
                      <>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>CGST @ 9%</span>
                            <span>₹{cgstAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>SGST @ 9%</span>
                            <span>₹{sgstAmount.toFixed(2)}</span>
                          </div>
                      </>
                  ) : (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>IGST @ 18%</span>
                        <span>₹{igstAmount.toFixed(2)}</span>
                      </div>
                  )}
                </div>
                <div className="flex justify-between items-center font-bold text-lg pt-2 text-primary">
                  <span>Total Payable</span>
                  <span className="text-xl">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between pt-6 border-t border-border">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep} disabled={loading} className="min-w-[100px]">Back</Button>
              ) : <div />}
              
              {step < 5 ? (
                <Button onClick={nextStep} disabled={loading} className="min-w-[100px]">Next</Button>
              ) : (
                <Button onClick={handleCheckout} disabled={loading || (!isRazorpayLoaded && !razorpayScriptError)} className="min-w-[180px]">
                  {loading ? <span className="flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {loadingText}</span> : `Pay ₹${totalAmount.toFixed(2)}`}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutPage;