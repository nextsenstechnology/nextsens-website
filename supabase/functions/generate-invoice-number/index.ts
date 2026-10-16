import { corsHeaders } from "./cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const date = new Date();
    const month = date.getMonth(); // 0 = Jan, 11 = Dec
    const year = date.getFullYear();
    
    let startYear, endYear;
    if (month < 3) { // Jan, Feb, Mar belong to previous year's FY
       startYear = year - 1;
       endYear = year;
    } else {
       startYear = year;
       endYear = year + 1;
    }
    
    const fy = `${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`;

    // Call RPC to increment and get next serial
    const { data: serialCount, error } = await supabase.rpc('increment_invoice_counter', { fy });

    if (error) {
        throw error;
    }

    const paddedSerial = serialCount.toString().padStart(2, '0');
    const invoiceNumber = `NST/${fy}/${paddedSerial}`;

    return new Response(JSON.stringify({ success: true, invoiceNumber }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});