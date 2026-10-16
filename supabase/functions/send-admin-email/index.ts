import { corsHeaders } from "./cors.ts";
import nodemailer from "npm:nodemailer";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, customerName, customerEmail, customerMobile, customerCompany, billingAddress, shippingAddress, gstinNumber, items, subtotal, gstAmount, totalAmount, paymentStatus, createdAt, taxType, cgstAmount, sgstAmount, igstAmount, customerState } = await req.json();
    const hostingerPassword = Deno.env.get('HOSTINGER_EMAIL_PASSWORD');

    if (!hostingerPassword) {
      throw new Error("Hostinger email credentials are not configured");
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true, 
      auth: {
        user: 'info@nextsenstech.com',
        pass: hostingerPassword
      }
    });

    const adminEmail = 'nextsenstechnology@gmail.com';

    const taxHtml = taxType === 'CGST_SGST' 
        ? `<p style="text-align: right; margin: 2px 0;"><strong>CGST (9%):</strong> ₹${Number(cgstAmount || 0).toFixed(2)}</p>
           <p style="text-align: right; margin: 2px 0;"><strong>SGST (9%):</strong> ₹${Number(sgstAmount || 0).toFixed(2)}</p>`
        : `<p style="text-align: right; margin: 2px 0;"><strong>IGST (18%):</strong> ₹${Number(igstAmount || gstAmount || 0).toFixed(2)}</p>`;


    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Order Received: ${orderId}</h2>
        <p><strong>Date:</strong> ${new Date(createdAt || Date.now()).toLocaleString()}</p>
        <p><strong>Payment Status:</strong> ${paymentStatus || 'Paid'}</p>
        <p><strong>Tax State Region:</strong> ${customerState}</p>
        
        <h3>Customer Details</h3>
        <p>
          <strong>Name:</strong> ${customerName}<br/>
          <strong>Company:</strong> ${customerCompany || 'N/A'}<br/>
          <strong>Email:</strong> ${customerEmail}<br/>
          <strong>Mobile:</strong> ${customerMobile}<br/>
          <strong>GSTIN:</strong> ${gstinNumber || 'N/A'}
        </p>

        <h3>Shipping Address</h3>
        <p>${shippingAddress?.line || ''}, ${shippingAddress?.city || ''}, ${shippingAddress?.state || ''} - ${shippingAddress?.pincode || ''}</p>

        <h3>Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Product</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Qty</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Unit Price</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Total</th>
          </tr>
          ${items.map((item: any) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${item.name || item.description || ''}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${Number(item.price).toFixed(2)}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${(item.quantity * Number(item.price)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>

        <p style="text-align: right; margin: 2px 0;"><strong>Taxable Value:</strong> ₹${Number(subtotal).toFixed(2)}</p>
        ${taxHtml}
        <h3 style="text-align: right; color: #1e3a8a;">Total Amount: ₹${Number(totalAmount).toFixed(2)}</h3>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"NextSens Orders" <info@nextsenstech.com>`,
      to: adminEmail,
      subject: `New Order Received - ${orderId} (${customerName})`,
      html: htmlContent
    });

    return new Response(JSON.stringify({ success: true, messageId: info.messageId }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error("Admin Email Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});