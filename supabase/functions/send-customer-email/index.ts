import { corsHeaders } from "./cors.ts";
import nodemailer from "npm:nodemailer";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, customerName, email, billingAddress, shippingAddress, items, subtotal, gstAmount, totalAmount, invoicePdfUrl, taxType, cgstAmount, sgstAmount, igstAmount } = await req.json();
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

    const taxHtml = taxType === 'CGST_SGST' 
        ? `<p style="margin: 5px 0;">CGST (9%): ₹${Number(cgstAmount || 0).toFixed(2)}</p>
           <p style="margin: 5px 0;">SGST (9%): ₹${Number(sgstAmount || 0).toFixed(2)}</p>`
        : `<p style="margin: 5px 0;">IGST (18%): ₹${Number(igstAmount || gstAmount || 0).toFixed(2)}</p>`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #ea580c;">
          <h1 style="color: #1e3a8a; margin: 0;">NEXTSENS TECHNOLOGY</h1>
          <p style="font-style: italic; color: #666; margin: 5px 0 0 0;">Sensing Tomorrow, Today</p>
        </div>

        <div style="padding: 20px 0;">
          <h2 style="color: #1e3a8a;">Thank you for your order, ${customerName}!</h2>
          <p>Your order <strong>${orderId}</strong> has been successfully placed and payment is confirmed.</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #1e3a8a;">Order Summary</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            
            <p><strong>Shipping Address:</strong><br/>
            ${shippingAddress?.line || ''}<br/>
            ${shippingAddress?.city || ''}, ${shippingAddress?.state || ''} ${shippingAddress?.pincode || ''}</p>
          </div>

          <h3 style="color: #1e3a8a;">Product Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="background-color: #f3f4f6; text-align: left;">
              <th style="padding: 10px; border-bottom: 2px solid #ddd;">Item</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Price</th>
              <th style="padding: 10px; border-bottom: 2px solid #ddd; text-align: right;">Total</th>
            </tr>
            ${items.map((item: any) => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name || item.description || ''}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${Number(item.price).toFixed(2)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.quantity * Number(item.price)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>

          <div style="text-align: right; margin-bottom: 30px;">
            <p style="margin: 5px 0;">Taxable Value: ₹${Number(subtotal).toFixed(2)}</p>
            ${taxHtml}
            <h3 style="margin: 10px 0; color: #ea580c; font-size: 1.2rem;">Total Amount: ₹${Number(totalAmount).toFixed(2)}</h3>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${invoicePdfUrl}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Download Tax Invoice</a>
          </div>
        </div>
      </div>
    `;

    let attachments = [];
    if (invoicePdfUrl) {
        try {
            const pdfRes = await fetch(invoicePdfUrl);
            const arrayBuffer = await pdfRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            attachments.push({
                filename: `Invoice_${orderId}.pdf`,
                content: buffer,
                contentType: 'application/pdf'
            });
        } catch (e) {
            console.error("Failed to fetch PDF for attachment", e);
        }
    }

    const info = await transporter.sendMail({
      from: `"NextSens Technology" <info@nextsenstech.com>`,
      to: email,
      subject: `Order Confirmation - ${orderId}`,
      html: htmlContent,
      attachments: attachments
    });

    return new Response(JSON.stringify({ success: true, messageId: info.messageId }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error("Customer Email Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});