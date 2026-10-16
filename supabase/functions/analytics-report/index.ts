import { corsHeaders } from "./cors.ts";

/**
 * Website Analytics report endpoint.
 *
 * Returns aggregated Google Analytics 4 data for the admin Website Analytics
 * panel. When GA4 credentials are not configured, it returns
 * `{ connected: false }` so the UI can show the "not connected yet" state
 * instead of fabricating numbers.
 *
 * Required secrets (set via set_supabase_secret):
 *   GA4_MEASUREMENT_ID  - e.g. G-XXXXXXXX
 *   GA4_PROPERTY_ID     - numeric GA4 property id
 *   GA4_CLIENT_EMAIL    - service account email
 *   GA4_PRIVATE_KEY     - service account private key (PEM)
 *
 * This function NEVER fabricates visitor data.
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const measurementId = Deno.env.get('GA4_MEASUREMENT_ID');
  const propertyId = Deno.env.get('GA4_PROPERTY_ID');
  const clientEmail = Deno.env.get('GA4_CLIENT_EMAIL');
  const privateKey = Deno.env.get('GA4_PRIVATE_KEY');

  if (!measurementId || !propertyId || !clientEmail || !privateKey) {
    return new Response(
      JSON.stringify({ connected: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  // GA4 Data API integration is intentionally not bundled here to avoid
  // fabricating data. When credentials are supplied, wire up the Google
  // Analytics Data API (https://developers.google.com/analytics/devguides/reporting/data/v1)
  // using a JWT exchange for an access token, then query runReport with the
  // requested date range and return aggregated rows/metrics.
  //
  // Until then, report a graceful "configured but not yet implemented" state
  // rather than fake numbers.
  return new Response(
    JSON.stringify({
      connected: false,
      note: 'GA4 credentials detected. Reporting adapter not yet wired.',
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
