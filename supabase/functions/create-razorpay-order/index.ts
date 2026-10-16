import { corsHeaders } from "./cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

/**
 * ==========================================
 * LIVE PAYMENT FLOW & SECURITY DOCUMENTATION
 * ==========================================
 * 
 * LIVE PAYMENT FLOW (create-razorpay-order):
 * 1. This Edge Function receives the order amount and details from the frontend.
 * 2. It reads the LIVE `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` from Supabase's secure environment variables.
 * 3. It makes a direct Server-to-Server API call to Razorpay (https://api.razorpay.com/v1/orders) to create a real LIVE order.
 * 4. Razorpay responds with a `razorpay_order_id` which acts as a secure session token for the transaction.
 * 5. This Edge Function returns the `razorpay_order_id` and the `key_id` to the frontend so it can open the checkout popup.
 * 
 * SECURITY NOTES:
 * - By executing this logic in a Supabase Edge Function, the `RAZORPAY_KEY_SECRET` is NEVER exposed to the public internet or frontend clients.
 * - Server-side price integrity checks verify item prices against the database to block tampering.
 * ==========================================
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { amount, currency = 'INR', customer_email, customer_name, order_data } = body;

    const key_id = Deno.env.get('RAZORPAY_KEY_ID');
    const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!key_id || !key_secret) {
      throw new Error('Razorpay LIVE keys are missing in Edge Function environment variables.');
    }

    let finalAmount = amount;

    // Server-side price integrity check: verify prices against database
    if (order_data?.items && Array.isArray(order_data.items) && order_data.items.length > 0) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

      if (supabaseUrl && supabaseKey) {
        try {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const itemIds = order_data.items.map((i: any) => i.id || i.product_id).filter(Boolean);

          if (itemIds.length > 0) {
            const { data: dbProducts } = await supabase
              .from('products')
              .select('id, price, discount_percentage, base_price')
              .in('id', itemIds);

            if (dbProducts && dbProducts.length > 0) {
              const productMap = new Map(dbProducts.map((p: any) => [p.id, p]));
              let computedSubtotal = 0;

              for (const item of order_data.items) {
                const productId = item.id || item.product_id;
                const dbProd = productMap.get(productId);
                const qty = Math.max(1, parseInt(item.quantity) || 1);

                if (dbProd) {
                  let effectiveUnitPrice = Number(dbProd.price) || 0;
                  if (dbProd.discount_percentage && dbProd.discount_percentage > 0) {
                    const base = Number(dbProd.base_price || dbProd.price) || 0;
                    effectiveUnitPrice = base * (1 - dbProd.discount_percentage / 100);
                  }
                  computedSubtotal += effectiveUnitPrice * qty;
                } else {
                  computedSubtotal += (Number(item.price) || 0) * qty;
                }
              }

              const computedGst = computedSubtotal * 0.18;
              const computedTotalPaise = Math.round((computedSubtotal + computedGst) * 100);

              // Block price tampering: if client submitted a lower price, enforce server computed total
              if (amount < computedTotalPaise - 100) {
                console.warn(`Price tampering detected and blocked! Client sent: ${amount}, Expected: ${computedTotalPaise}`);
                finalAmount = computedTotalPaise;
              }
            }
          }
        } catch (verifyErr) {
          console.error("Price verification warning:", verifyErr);
        }
      }
    }

    const authHeader = `Basic ${btoa(`${key_id}:${key_secret}`)}`;

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        amount: finalAmount,
        currency,
        receipt: `receipt_${Date.now()}`
      }),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error('Razorpay API error:', errorData);
      throw new Error(`Razorpay API error: ${errorData.error?.description || 'Failed to create order'}`);
    }

    const razorpayOrder = await razorpayResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: key_id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});