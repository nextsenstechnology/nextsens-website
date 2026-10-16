import { corsHeaders } from "./cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import PDFDocument from "npm:pdfkit";

function numberToWords(num: number): string {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (num === 0) return 'Zero';
    const numStr = num.toString().split('.')[0];
    if (numStr.length > 9) return 'Overflow';
    const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return ''; 
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str.trim() + ' Only';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const orderData = await req.json();
    const { 
        orderId, invoiceNumber, invoiceDate, customerName, customerCompany, customerAddress, 
        gstinNumber, items, subtotal, discountAmount, taxableValue, 
        gstAmount, totalAmount, taxType, cgstAmount, sgstAmount, igstAmount 
    } = orderData;
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Stamp Image
    let stampBuffer = null;
    try {
        const stampRes = await fetch("https://horizons-cdn.hostinger.com/5eae4c13-238e-4448-acca-f1360c74f81b/cd5d1abba255f83263c524a2bee52e55.png");
        if (stampRes.ok) {
            const arrayBuffer = await stampRes.arrayBuffer();
            stampBuffer = Buffer.from(arrayBuffer);
        }
    } catch (e) {
        console.warn("Could not load stamp image", e);
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const chunks: Uint8Array[] = [];
        
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', async () => {
          const pdfBytes = new Uint8Array(chunks.reduce((acc, val) => acc + val.length, 0));
          let offset = 0;
          for (const chunk of chunks) {
            pdfBytes.set(chunk, offset);
            offset += chunk.length;
          }

          const filename = `Invoice_${invoiceNumber ? invoiceNumber.replace(/\//g, '_') : orderId}.pdf`;
          
          const { error } = await supabase.storage
            .from('invoices')
            .upload(filename, pdfBytes, { contentType: 'application/pdf', upsert: true });

          if (error) throw error;

          const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(filename);

          resolve(new Response(JSON.stringify({ success: true, pdfUrl: urlData.publicUrl }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }));
        });

        const pageWidth = doc.page.width;
        const margin = 40;
        const contentWidth = pageWidth - (margin * 2);

        // Header
        doc.roundedRect(margin, margin, 40, 40, 5).fill('#1e3a8a');
        doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('NST', margin + 4, margin + 14);
        
        doc.fillColor('#ea580c').fontSize(20).text('NEXTSENS TECHNOLOGY', margin + 50, margin + 5);
        doc.fillColor('#666666').fontSize(10).font('Helvetica-Oblique').text('Sensing Tomorrow, Today', margin + 50, margin + 28);
        
        doc.fillColor('#333333').fontSize(9).font('Helvetica').text('Email: nextsenstechnology@gmail.com', margin, margin + 5, { align: 'right', width: contentWidth });
        doc.text('Website: www.nextsenstetech.com', margin, margin + 18, { align: 'right', width: contentWidth });
        doc.text('Phone: +91-9321175585', margin, margin + 31, { align: 'right', width: contentWidth });
        
        doc.moveTo(margin, margin + 50).lineTo(pageWidth - margin, margin + 50).strokeColor('#dddddd').stroke();

        // Title
        doc.moveDown(2);
        doc.fillColor('#000000').fontSize(14).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
        doc.moveDown(1);

        // Bill To
        const billToY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', margin, billToY);
        doc.font('Helvetica').text(customerName || '', margin, doc.y + 2);
        if (customerCompany) doc.text(customerCompany, margin, doc.y);
        
        if (customerAddress) {
            if (typeof customerAddress === 'string') {
                doc.text(customerAddress, margin, doc.y);
            } else {
                doc.text(`${customerAddress.line || ''}`, margin, doc.y);
                doc.text(`${customerAddress.city || ''}, ${customerAddress.state || ''} ${customerAddress.pincode || ''}`, margin, doc.y);
            }
        }
        
        if (gstinNumber) doc.font('Helvetica-Bold').text(`GSTIN: `, margin, doc.y).font('Helvetica').text(gstinNumber, margin + 40, doc.y - 12);
        
        doc.font('Helvetica-Bold').text('Invoice No: ', margin + 280, billToY);
        doc.font('Helvetica').text(invoiceNumber || orderId, margin + 350, billToY);
        
        doc.font('Helvetica-Bold').text('Date: ', margin + 280, billToY + 15);
        doc.font('Helvetica').text(invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'), margin + 350, billToY + 15);

        doc.moveDown(3);

        // Table Header
        const tableTop = doc.y;
        const colWidths = [40, 50, 200, 80, 40, 90]; 
        let currentX = margin;
        
        doc.rect(margin, tableTop, contentWidth, 20).fillColor('#f3f4f6').fill();
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9);
        
        const headers = ['Sr. No.', 'HSN', 'Description', 'Price/Item', 'Qty', 'Total (Rs)'];
        headers.forEach((h, i) => {
            doc.text(h, currentX + 5, tableTop + 5, { width: colWidths[i] - 10, align: i > 2 ? 'right' : 'left' });
            currentX += colWidths[i];
        });

        // Table Rows
        let tableY = tableTop + 20;
        doc.font('Helvetica');
        items.forEach((item: any, idx: number) => {
            currentX = margin;
            const hsn = '9027'; // Forced as requested
            const itemPrice = Number(item.price);
            const itemTotal = item.quantity * itemPrice;
            const includedItems: string[] = Array.isArray(item.included_items) ? item.included_items : [];
            const isBundle = !!item.isBundle && includedItems.length > 0;
            // Taller row for bundles so included items fit underneath the name
            const rowHeight = isBundle ? 25 + (includedItems.length * 11) + 4 : 25;

            const rowData = [
                (idx + 1).toString(),
                hsn,
                item.name || item.description || '',
                `Rs. ${itemPrice.toFixed(2)}`,
                item.quantity.toString(),
                `Rs. ${itemTotal.toFixed(2)}`
            ];

            doc.moveTo(margin, tableY).lineTo(pageWidth - margin, tableY).strokeColor('#dddddd').stroke();

            rowData.forEach((d, i) => {
                 doc.text(d, currentX + 5, tableY + 5, { width: colWidths[i] - 10, align: i > 2 ? 'right' : 'left' });
                 currentX += colWidths[i];
            });

            // List included components for bundle line items
            if (isBundle) {
                doc.fontSize(7).fillColor('#666666');
                includedItems.forEach((inc: string) => {
                    doc.text(`• ${inc}`, margin + colWidths[0] + colWidths[1] + 5, doc.y + 2, { width: colWidths[2] - 10 });
                });
                doc.fontSize(9).fillColor('#000000');
            }

            tableY += rowHeight;
        });
        
        doc.moveTo(margin, tableY).lineTo(pageWidth - margin, tableY).strokeColor('#dddddd').stroke();

        // Calculations
        tableY += 10;
        const calcLeft = margin + 300;
        const calcWidth = contentWidth - 300;
        
        const calcSubtotal = Number(subtotal) || 0;
        const calcDiscount = Number(discountAmount) || 0;
        const calcTaxable = Number(taxableValue) || calcSubtotal - calcDiscount;
        const calcTotal = Number(totalAmount) || 0;

        doc.font('Helvetica').text('Subtotal:', calcLeft, tableY);
        doc.text(`Rs. ${calcSubtotal.toFixed(2)}`, calcLeft, tableY, { align: 'right', width: calcWidth });
        tableY += 15;
        
        if (calcDiscount > 0) {
            doc.text('Discount:', calcLeft, tableY); 
            doc.text(`Rs. ${calcDiscount.toFixed(2)}`, calcLeft, tableY, { align: 'right', width: calcWidth });
            tableY += 15;
        }

        doc.text('Taxable Value:', calcLeft, tableY);
        doc.text(`Rs. ${calcTaxable.toFixed(2)}`, calcLeft, tableY, { align: 'right', width: calcWidth });
        tableY += 15;

        if (taxType === 'CGST_SGST') {
            doc.text('CGST @ 9%:', calcLeft, tableY);
            doc.text(`Rs. ${Number(cgstAmount || 0).toFixed(2)}`, calcLeft, tableY, { align: 'right', width: calcWidth });
            tableY += 15;
            doc.text('SGST @ 9%:', calcLeft, tableY);
            doc.text(`Rs. ${Number(sgstAmount || 0).toFixed(2)}`, calcLeft, tableY, { align: 'right', width: calcWidth });
            tableY += 15;
        } else {
            doc.text('IGST @ 18%:', calcLeft, tableY);
            doc.text(`Rs. ${Number(igstAmount || gstAmount || 0).toFixed(2)}`, calcLeft, tableY, { align: 'right', width: calcWidth });
            tableY += 15;
        }

        doc.font('Helvetica-Bold').text('Total FOR Price:', calcLeft, tableY);
        doc.text(`Rs. ${calcTotal.toFixed(2)}`, calcLeft, tableY, { align: 'right', width: calcWidth });
        
        // Amount in Words
        doc.moveDown(2);
        doc.font('Helvetica-Bold').fontSize(10).text(`Total Amount including Tax (words) – INR ${numberToWords(calcTotal)}`, margin, doc.y);

        // Footer block
        let currentY = doc.y + 30;
        if (currentY > doc.page.height - 200) { doc.addPage(); currentY = margin; } 
        
        doc.font('Helvetica-Bold').fontSize(9).text('PAN: AKPPA6995D', margin, currentY);
        doc.text('GST: 27AKPPA6995D1ZT', margin, currentY + 15);

        // Signature Box - placed on left as requested
        const sigX = margin;
        doc.rect(sigX, currentY + 35, 200, 80).stroke();
        doc.font('Helvetica-Bold').text('For NEXTSENS TECHNOLOGY', sigX + 5, currentY + 40, { width: 190, align: 'center' });
        
        if (stampBuffer) {
            try {
                // place stamp inside signature block
                doc.image(stampBuffer, sigX + 60, currentY + 55, { width: 80 });
            } catch (e) {
                console.warn("Could not draw stamp", e);
            }
        }
        
        doc.font('Helvetica').fontSize(8).text('Authorized Signatory', sigX + 5, currentY + 100, { width: 190, align: 'center' });

        doc.fontSize(8).text('Certification: I/we hereby certify that this invoice shows the actual price of the good described and that all particulars are true and correct. Subject to Thane Jurisdiction only', margin, currentY + 130, { width: contentWidth });

        doc.font('Helvetica-Bold').fillColor('#ea580c').text('NOTE: You will receive the TAX INVOICE/Bill with correct Invoice Number as per proper sequence along with your material. Further, you will receive tracking details on your email/WhatsApp number once the material is dispatched from our side.', margin, currentY + 160, { width: contentWidth });

        doc.end();
      } catch (err) {
        resolve(new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }));
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});