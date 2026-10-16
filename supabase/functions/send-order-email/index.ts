import { corsHeaders } from "./cors.ts";
import nodemailer from "npm:nodemailer";

export default async function serve(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderData, invoiceUrl } = await req.json();
    console.log(`Sending email for order ${orderData.order_id} to ${orderData.email}`);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: Deno.env.get('GMAIL_EMAIL'),
        pass: Deno.env.get('GMAIL_APP_PASSWORD')
      }
    });

    const itemsHtml = orderData.items.map(i => `<li>${i.name} (x${i.quantity}) - Rs. ${i.price * i.quantity}</li>`).join('');

    const mailOptions = {
      from: `"NextSens Technology" <${Deno.env.get('GMAIL_EMAIL')}>`,
      to: orderData.email,
      subject: `Order Confirmation - Order ID: ${orderData.order_id}`,
      html: `
        <h2>Thank you for your order, ${orderData.customer_name}!</h2>
        <p>Your payment was successful and your order has been placed.</p>
        <p><strong>Order ID:</strong> ${orderData.order_id}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        
        <h3>Order Details:</h3>
        <ul>${itemsHtml}</ul>
        <p><strong>Subtotal:</strong> Rs. ${orderData.subtotal}</p>
        ${orderData.gst_amount ? `<p><strong>GST (18%):</strong> Rs. ${orderData.gst_amount}</p>` : ''}
        <p><strong>Total Amount Paid:</strong> Rs. ${orderData.total_amount}</p>
        ${orderData.gst_number ? `<p><strong>GST Number:</strong> ${orderData.gst_number}</p>` : ''}

        <p><a href="${invoiceUrl}">Click here to download your invoice</a></p>

        <hr />
        <h4>Bank Details</h4>
        <p>Account Name: NEXTSENS TECHNOLOGY<br/>
        Bank: HDFC BANK LTD<br/>
        Account Number: 50200115293020<br/>
        IFSC Code: HDFC0000194</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    // Even if email fails, we don't want to fail the whole process if payment was successful
    return new Response(JSON.stringify({ error: error.message, success: false }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}