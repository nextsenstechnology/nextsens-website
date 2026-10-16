import { corsHeaders } from "./cors.ts";

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
 * - This prevents malicious actors from generating arbitrary orders or viewing merchant secrets.
 * 
 * TESTING INSTRUCTIONS:
 * - Ensure LIVE keys are populated in your Supabase project's secrets.
 * - Real funds will be processed unless you temporarily replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` 
 *   with Razorpay Test Keys via the Supabase Dashboard.
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

    const authHeader = `Basic ${btoa(`${key_id}:${key_secret}`)}`;

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        amount,
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