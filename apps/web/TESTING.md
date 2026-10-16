# Testing Checklist

## End-to-End Payment Flow
- [ ] Add items to cart and proceed to checkout
- [ ] Fill in customer details, billing, and shipping addresses
- [ ] Complete successful Razorpay payment
- [ ] Redirected to Order Confirmation Page with order details

## Invoice Generation & Numbering
- [ ] Invoice number follows format `NST/<FY>/<Serial>` (e.g., `NST/25-26/01`)
- [ ] Sequential numbering increments correctly for consecutive orders
- [ ] Financial year (FY) is calculated correctly (April 1st to March 31st)
- [ ] Verify `invoice_counters` table updates correctly in Supabase

## PDF Formatting
- [ ] NST Logo and "NEXTSENS TECHNOLOGY" heading present
- [ ] Tagline "Sensing Tomorrow, Today" present
- [ ] "TAX INVOICE" title clearly visible
- [ ] Bill To section includes customer details
- [ ] Product table includes: Sr. No., HSN, Description, Price, Qty, Total
- [ ] Calculations section includes: Subtotal, Discount, Taxable Value, IGST @ 18%
- [ ] Total amount is written in words correctly
- [ ] PAN (AKPPA6995D) and GST (27AKPPA6995D1ZT) are present
- [ ] Certification text is exact: "I/we hereby certify that this invoice shows the actual price of the good described and that all particulars are true and correct. Subject to Thane Jurisdiction only"
- [ ] Authorized signatory stamp image is visible at the bottom right
- [ ] Bank details are NOT present
- [ ] Company address is NOT present

## Email Delivery
- [ ] Customer receives email with subject containing Order ID
- [ ] Customer email has professional formatting, order summary, and PDF attached
- [ ] Admin receives notification at `nextsenstechnology@gmail.com`
- [ ] Admin email contains full order payload and customer details
- [ ] Both emails trigger only after payment is verified as successful