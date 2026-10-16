import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Phone, Mail, MapPin, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
const ContactPage = () => {
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: {
      errors
    },
    reset
  } = useForm();
  const onSubmit = async data => {
    setIsSubmitting(true);
    const {
      error
    } = await supabase.functions.invoke('contact-form', {
      body: JSON.stringify(data)
    });
    setIsSubmitting(false);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: "Please try again later."
      });
    } else {
      toast({
        title: "Message Sent! 📬",
        description: "Thank you for reaching out. We'll get back to you shortly!"
      });
      reset();
    }
  };
  return <>
      <Helmet>
        <title>Contact Us | NextSens Tech</title>
        <meta name="description" content="Get in touch with NextSens Tech for sales inquiries, technical support, or any questions. We are here to help you with your electrochemical instrument needs." />
        <link rel="canonical" href="https://www.nextsenstech.com/contact" />
      </Helmet>

      <div className="bg-secondary/30">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl">
              Get In <span className="text-primary">Touch</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
              We're here to help and answer any question you might have. We look forward to hearing from you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <motion.div initial={{
            opacity: 0,
            x: -50
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.7,
            delay: 0.1
          }} className="space-y-8">
              <div className="flex items-start space-x-4 p-6 rounded-lg hover:bg-background/50 transition-colors duration-300">
                <div className="flex-shrink-0 h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Email Us</h3>
                  <p className="text-muted-foreground">Our team is here to help.</p>
                  <a href="mailto:info@nextsenstech.com" className="text-primary hover:underline font-medium">info@nextsenstech.com</a>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-6 rounded-lg hover:bg-background/50 transition-colors duration-300">
                <div className="flex-shrink-0 h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Our Office</h3>
                  <p className="text-muted-foreground">Mumbai, Maharashtra, India</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-6 rounded-lg hover:bg-background/50 transition-colors duration-300">
                <div className="flex-shrink-0 h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">WhatApp or Call Us</h3>
                  <p className="text-muted-foreground">Mon-Sat from 9am to 9pm IST</p>
                  <a href="tel:+919321175585" className="text-primary font-medium hover:underline">+91-9321175585</a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{
            opacity: 0,
            y: 50
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.7,
            delay: 0.2
          }} className="lg:col-span-2 bg-background p-8 rounded-2xl shadow-lg border">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" {...register("name", {
                  required: "Name is required"
                })} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john.doe@example.com" {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address"
                  }
                })} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+91 12345 67890" {...register("phone", {
                  required: "Phone number is required"
                })} />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Inquiry about pH Electrodes" {...register("subject", {
                  required: "Subject is required"
                })} />
                  {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
                </div>
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Type your message here." {...register("message", {
                  required: "Message is required"
                })} />
                  {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
                </div>
                <div>
                  <Button type="submit" className="w-full flex items-center justify-center text-base py-3" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
                    Send Message
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>;
};
export default ContactPage;