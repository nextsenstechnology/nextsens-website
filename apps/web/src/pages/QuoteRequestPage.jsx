import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet';
    import { useParams, Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { useForm } from 'react-hook-form';
    import { Send, Loader2, ArrowLeft, XCircle } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';

    const QuoteRequestPage = () => {
      const { id } = useParams();
      const [product, setProduct] = useState(null);
      const [loadingProduct, setLoadingProduct] = useState(true);
      const { toast } = useToast();
      const [isSubmitting, setIsSubmitting] = useState(false);
      const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

      useEffect(() => {
        const fetchProduct = async () => {
          setLoadingProduct(true);
          const { data, error } = await supabase.from('products').select('id, name').eq('id', id).single();
          if (error) {
            console.error("Error fetching product:", error);
          } else {
            setProduct(data);
            setValue('productName', data.name);
          }
          setLoadingProduct(false);
        };
        fetchProduct();
      }, [id, setValue]);

      const onSubmit = async (data) => {
        setIsSubmitting(true);
        const submissionData = {
          ...data,
          subject: `Bulk Order Quote Request: ${data.productName}`,
          message: `Product: ${data.productName}\nQuantity: ${data.quantity}\n\nMessage:\n${data.message}`,
        };

        const { error } = await supabase.functions.invoke('contact-form', {
          body: JSON.stringify(submissionData),
        });

        setIsSubmitting(false);
        if (error) {
          toast({
            variant: "destructive",
            title: "Error Sending Request",
            description: "Please try again later.",
          });
        } else {
          toast({
            title: "Request Sent! 📬",
            description: "Your quote request has been sent successfully. We'll get back to you shortly!",
          });
          reset();
          setValue('productName', product.name);
        }
      };

      if (loadingProduct) {
        return (
          <div className="flex justify-center items-center h-[60vh] bg-background">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
        );
      }

      if (!product) {
        return (
          <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Link to="/store" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6">
              <ArrowLeft size={16} />
              Back to Store
            </Link>
            <div className="text-center text-red-500 p-8 bg-destructive/10 rounded-2xl">
              <XCircle className="mx-auto h-16 w-16 mb-4" />
              <p className="mb-6">Error: The product you are requesting a quote for could not be found.</p>
            </div>
          </div>
        );
      }

      return (
        <>
          <Helmet>
            <title>Request a Quote | NextSens Tech</title>
            <meta name="description" content={`Request a bulk order quote for ${product?.name}. Fill out the form to get in touch with our sales team.`} />
          </Helmet>
          <div className="bg-secondary/30">
            <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl">
                  Request a <span className="text-primary">Quote</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
                  Interested in a bulk order? Fill out the form below and we'll get back to you with a competitive quote.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="bg-background p-8 rounded-2xl shadow-lg border">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Honeypot field for bot spam prevention (invisible to real humans) */}
                  <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                    <label htmlFor="hp_check">Leave this field blank</label>
                    <input
                      id="hp_check"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      {...register("hp_check")}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="productName">Product</Label>
                      <Input id="productName" {...register("productName")} readOnly className="bg-muted" />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" placeholder="e.g., 50" {...register("quantity", { required: "Quantity is required", min: { value: 1, message: "Quantity must be at least 1" } })} />
                      {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                    </div>
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" {...register("name", { required: "Name is required" })} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="company">Company Name (Optional)</Label>
                    <Input id="company" placeholder="ACME Inc." {...register("company")} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john.doe@example.com" {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } })} />
                      {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+91 12345 67890" {...register("phone", { required: "Phone number is required" })} />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                    </div>
                  </div>
                  
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="message">Additional Details</Label>
                    <Textarea id="message" placeholder="Please provide any specific requirements or questions." {...register("message", { required: "Message is required" })} />
                    {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
                  </div>

                  <div>
                    <Button type="submit" className="w-full flex items-center justify-center text-base py-3" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
                      Submit Quote Request
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </>
      );
    };

    export default QuoteRequestPage;