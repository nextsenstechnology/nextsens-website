import { corsHeaders } from "./cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_data } = await req.json();
    const secret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    if (!secret) throw new Error("Razorpay secret not configured");

    const encoder = new TextEncoder();
    const data = encoder.encode(razorpay_order_id + "|" + razorpay_payment_id);
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const generatedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (generatedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const orderId = `ORD-${Date.now()}`;

    // Generate a customer-facing, atomic, daily-resetting order number
    // (ORD-YYYYMMDD-NNN) server-side. Falls back gracefully if the RPC is
    // unavailable so the payment flow is never blocked.
    let customerOrderNumber: string | null = null;
    try {
      const { data: ordNum, error: ordNumError } = await supabase
        .rpc('generate_order_number');
      if (!ordNumError && ordNum) {
        customerOrderNumber = ordNum as string;
      }
    } catch (e) {
      console.error('Order number generation failed:', e);
    }

    // Insert initial order
    const { data: insertedOrder, error: insertError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        order_number: customerOrderNumber,
        customer_name: order_data.customer_name,
        email: order_data.email,
        mobile: order_data.mobile,
        company_name: order_data.company_name,
        gst_number: order_data.gst_number,
        billing_address: order_data.billing_address,
        shipping_address: order_data.shipping_address,
        items: order_data.items,
        subtotal: order_data.subtotal,
        gst_amount: order_data.gst_amount,
        total_amount: order_data.total_amount,
        payment_status: 'completed',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        email_sent: false,
        customer_state: order_data.customer_state,
        tax_type: order_data.tax_type,
        cgst_amount: order_data.cgst_amount,
        sgst_amount: order_data.sgst_amount,
        igst_amount: order_data.igst_amount
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const edgeFunctionBase = supabaseUrl.replace('supabase.co', 'supabase.co/functions/v1');
    const authHeader = { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' };

    let generatedInvoiceNumber = null;
    let finalPdfUrl = null;
    let emailsSent = false;
    let postPaymentError = null;

    try {
      // 1. Generate Invoice Number
      console.log("Generating Invoice Number...");
      const numRes = await fetch(`${edgeFunctionBase}/generate-invoice-number`, {
        method: 'POST', headers: authHeader, body: JSON.stringify({ orderId })
      });
      const numData = await numRes.json();
      if (numData.success) {
          generatedInvoiceNumber = numData.invoiceNumber;
      }

      // 2. Generate PDF
      console.log("Generating Invoice PDF...");
      // item.price is the final discounted selling price (discount applied once,
      // before checkout). item.mrp carries the original base price so the invoice
      // can still show the MRP subtotal and the product discount separately.
      const baseTotal = order_data.items.reduce((sum, item) => sum + ((item.mrp ?? item.price) * item.quantity), 0);
      const discount = baseTotal - order_data.subtotal;

      const pdfPayload = {
          orderId,
          invoiceNumber: generatedInvoiceNumber,
          invoiceDate: new Date().toISOString(),
          customerName: order_data.customer_name,
          customerCompany: order_data.company_name,
          customerAddress: order_data.billing_address,
          gstinNumber: order_data.gst_number,
          items: order_data.items,
          subtotal: baseTotal,
          discountAmount: discount,
          taxableValue: order_data.subtotal,
          gstAmount: order_data.gst_amount,
          totalAmount: order_data.total_amount,
          customerState: order_data.customer_state,
          taxType: order_data.tax_type,
          cgstAmount: order_data.cgst_amount,
          sgstAmount: order_data.sgst_amount,
          igstAmount: order_data.igst_amount
      };

      const invRes = await fetch(`${edgeFunctionBase}/generate-invoice-pdf`, {
        method: 'POST', headers: authHeader, body: JSON.stringify(pdfPayload)
      });
      const invData = await invRes.json();
      
      if (invData.success && invData.pdfUrl) {
        finalPdfUrl = invData.pdfUrl;

        // 3. Send Customer Email
        const customerEmailRes = await fetch(`${edgeFunctionBase}/send-customer-email`, {
          method: 'POST', headers: authHeader, body: JSON.stringify({ 
             orderId,
             customerName: order_data.customer_name,
             email: order_data.email,
             billingAddress: order_data.billing_address,
             shippingAddress: order_data.shipping_address,
             items: order_data.items,
             subtotal: order_data.subtotal,
             gstAmount: order_data.gst_amount,
             totalAmount: order_data.total_amount,
             invoicePdfUrl: finalPdfUrl,
             taxType: order_data.tax_type,
             cgstAmount: order_data.cgst_amount,
             sgstAmount: order_data.sgst_amount,
             igstAmount: order_data.igst_amount
          })
        });
        const custData = await customerEmailRes.json();

        // 4. Send Admin Email
        const adminEmailRes = await fetch(`${edgeFunctionBase}/send-admin-email`, {
          method: 'POST', headers: authHeader, body: JSON.stringify({
            orderId,
            customerName: order_data.customer_name,
            customerEmail: order_data.email,
            customerMobile: order_data.mobile,
            customerCompany: order_data.company_name,
            billingAddress: order_data.billing_address,
            shippingAddress: order_data.shipping_address,
            gstinNumber: order_data.gst_number,
            items: order_data.items,
            subtotal: order_data.subtotal,
            gstAmount: order_data.gst_amount,
            totalAmount: order_data.total_amount,
            paymentStatus: 'completed',
            createdAt: insertedOrder.created_at,
            taxType: order_data.tax_type,
            cgstAmount: order_data.cgst_amount,
            sgstAmount: order_data.sgst_amount,
            igstAmount: order_data.igst_amount,
            customerState: order_data.customer_state
          })
        });
        const adminData = await adminEmailRes.json();

        if (custData.success && adminData.success) {
           emailsSent = true;
           console.log("Emails sent successfully");
        } else {
           console.error("Email sending failed partially.", { custData, adminData });
           postPaymentError = `Emails partially failed. Customer: ${custData.success}, Admin: ${adminData.success}`;
        }
      } else {
         console.error("Failed to generate PDF.", invData);
         postPaymentError = "PDF generation failed, emails skipped";
      }

      // 5. Update order record
      await supabase.from('orders').update({ 
          invoice_number: generatedInvoiceNumber,
          invoice_pdf_url: finalPdfUrl, 
          email_sent: emailsSent 
      }).eq('id', insertedOrder.id);

    } catch (processErr) {
       console.error("Post-payment processing error:", processErr);
       postPaymentError = processErr.message;
    }

    return new Response(JSON.stringify({ 
        success: true, 
        order_id: orderId, 
        order_number: customerOrderNumber,
        invoice_number: generatedInvoiceNumber,
        invoicePdfUrl: finalPdfUrl,
        emailsSent: emailsSent,
        postPaymentError,
        customer_email: order_data.email
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("Payment Verification Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});