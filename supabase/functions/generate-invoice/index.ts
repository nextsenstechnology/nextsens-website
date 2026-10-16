import { corsHeaders } from "./cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import PDFDocument from "npm:pdfkit";

// Helper to convert number to words (simplified for Indian Rupees)
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
    const { order_id, customer_name, company_name, email, mobile, billing_address, gst_number, items, subtotal, gst_amount, total_amount, created_at } = orderData;
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

          const filename = `Invoice_${order_id}.pdf`;
          
          const { data, error } = await supabase.storage
            .from('invoices')
            .upload(filename, pdfBytes, {
              contentType: 'application/pdf',
              upsert: true
            });

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from('invoices')
            .getPublicUrl(filename);

          resolve(new Response(JSON.stringify({ success: true, pdfUrl: urlData.publicUrl }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }));
        });

        // ================= PDF GENERATION =================
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

        // Bill To & Details Layout
        const billToY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', margin, billToY);
        doc.font('Helvetica').text(customer_name || '', margin, doc.y + 2);
        if (company_name) doc.text(company_name, margin, doc.y);
        doc.text(`${billing_address?.line || ''}`, margin, doc.y);
        doc.text(`${billing_address?.city || ''}, ${billing_address?.state || ''} ${billing_address?.pincode || ''}`, margin, doc.y);
        if (gst_number) doc.font('Helvetica-Bold').text(`GSTIN: `, margin, doc.y).font('Helvetica').text(gst_number, margin + 40, doc.y - 12); // rough alignment
        
        const invoiceDate = created_at ? new Date(created_at).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
        
        doc.font('Helvetica-Bold').text('Invoice No: ', margin + 250, billToY);
        doc.font('Helvetica').text(order_id, margin + 320, billToY);
        
        doc.font('Helvetica-Bold').text('Date: ', margin + 250, billToY + 15);
        doc.font('Helvetica').text(invoiceDate, margin + 320, billToY + 15);
        
        doc.font('Helvetica-Bold').text('Reference: ', margin + 250, billToY + 30);
        doc.font('Helvetica').text('Email', margin + 320, billToY + 30);

        doc.moveDown(3);

        // Table Header
        const tableTop = doc.y;
        const colWidths = [40, 70, 180, 80, 40, 90]; // Total 500
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
            const hsn = item.hsn || '90278090';
            const rowData = [
                (idx + 1).toString(),
                hsn,
                item.name,
                `Rs. ${Number(item.price).toFixed(2)}`,
                item.quantity.toString(),
                `Rs. ${(item.quantity * item.price).toFixed(2)}`
            ];
            
            // Draw line above
            doc.moveTo(margin, tableY).lineTo(pageWidth - margin, tableY).strokeColor('#dddddd').stroke();
            
            let maxRowHeight = 20; // min height
            // We should ideally calculate text height, but for simplicity assuming 1 line per item mostly.
            rowData.forEach((d, i) => {
                 doc.text(d, currentX + 5, tableY + 5, { width: colWidths[i] - 10, align: i > 2 ? 'right' : 'left' });
                 currentX += colWidths[i];
            });
            tableY += 25; // fixed row height for simplicity
        });
        
        doc.moveTo(margin, tableY).lineTo(pageWidth - margin, tableY).strokeColor('#dddddd').stroke();

        // Calculations
        tableY += 10;
        const calcLeft = margin + 300;
        const calcWidth = contentWidth - 300;
        
        doc.font('Helvetica').text('Subtotal:', calcLeft, tableY);
        doc.text(`Rs. ${Number(subtotal).toFixed(2)}`, calcLeft, tableY, { align: 'right', width: calcWidth });
        tableY += 15;
        
        doc.text('Discount @10%:', calcLeft, tableY); // Note: Assuming subtotal already has discount applied in DB, but showing it based on logic.
        // Actually the backend calculates subtotal = base * 0.9. So discount is base - subtotal.
        const base = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = base - subtotal;
        doc.text(`Rs. ${discount.toFixed(2)}`, calcLeft, tableY, { align: 'right', width: calcWidth });
        tableY += 15;

        doc.text('Taxable Value:', calcLeft, tableY);
        doc.text(`Rs. ${Number(subtotal).toFixed(2)}`, calcLeft, tableY, { align: 'right', width: calcWidth });
        tableY += 15;

        doc.text('IGST @ 18%:', calcLeft, tableY);
        doc.text(`Rs. ${Number(gst_amount).toFixed(2)}`, calcLeft, tableY, { align: 'right', width: calcWidth });
        tableY += 15;

        doc.font('Helvetica-Bold').text('Total FOR Price:', calcLeft, tableY);
        doc.text(`Rs. ${Number(total_amount).toFixed(2)}`, calcLeft, tableY, { align: 'right', width: calcWidth });
        
        // Amount in Words
        doc.moveDown(2);
        doc.font('Helvetica-Bold').fontSize(10).text(`Total Amount including Tax (words) – INR ${numberToWords(total_amount)}`, margin, doc.y);

        // Footer & Terms
        let currentY = doc.y + 30;
        if (currentY > doc.page.height - 200) { doc.addPage(); currentY = margin; } // Basic page break handling
        
        doc.font('Helvetica-Bold').fontSize(9).text('Company Details:', margin, currentY);
        doc.font('Helvetica').text('PAN: AKPPA6995D', margin, currentY + 15);
        doc.text('GST: 27AKPPA6995D1ZT', margin, currentY + 30);

        doc.font('Helvetica-Bold').text('Bank Details:', margin, currentY + 50);
        doc.font('Helvetica').text('A/c Name: NEXTSENS TECHNOLOGY', margin, currentY + 65);
        doc.text('Bank: HDFC BANK LTD', margin, currentY + 80);
        doc.text('Branch: KALYAN (W)', margin, currentY + 95);
        doc.text('A/c No: 50200115293020', margin, currentY + 110);
        doc.text('IFSC: HDFC0000194', margin, currentY + 125);

        // Signature Box
        doc.rect(margin + 300, currentY, contentWidth - 300, 80).stroke();
        doc.font('Helvetica-Bold').text('For NEXTSENS TECHNOLOGY', margin + 305, currentY + 5, { width: contentWidth - 310, align: 'center' });
        doc.font('Helvetica').text('Authorized Signatory', margin + 305, currentY + 65, { width: contentWidth - 310, align: 'center' });

        doc.fontSize(8).text('Certification: I/we hereby certify that this invoice shows the actual price of the good described and that all particulars are true and correct. Subject to Thane Jurisdiction only', margin, currentY + 145, { width: contentWidth });

        // Address Footer
        doc.fontSize(8).fillColor('#666666').text('Address: A5/203, PUNYODYA PARK, NEAR DON BOSCO SCHOOL, ADARWARDI JAIL ROAD, KALYAN WEST, THANE, Maharashtra (MH-05) 421301', margin, doc.page.height - 40, { align: 'center', width: contentWidth });

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