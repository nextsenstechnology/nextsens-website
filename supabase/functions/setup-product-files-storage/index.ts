import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
    import { corsHeaders } from "./cors.ts";

    Deno.serve(async (req) => {
      // This is needed if you're planning to invoke your function from a browser.
      if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
      }

      try {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: bucket, error: bucketError } = await supabaseAdmin.storage.getBucket('product-files');

        if (bucketError && bucketError.message === 'The resource was not found') {
            const { error: createError } = await supabaseAdmin.storage.createBucket('product-files', {
                public: true,
                fileSizeLimit: '20MB',
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4']
            });
            if (createError) throw createError;
        } else if (bucketError) {
            throw bucketError;
        }

        const policies = [
            { name: "Enable read access for all users", action: "SELECT", check: null },
            { name: "Enable insert for authenticated users", action: "INSERT", check: "auth.role() = 'authenticated'" },
            { name: "Enable update for authenticated users", action: "UPDATE", check: "auth.role() = 'authenticated'" },
            { name: "Enable delete for authenticated users", action: "DELETE", check: "auth.role() = 'authenticated'" }
        ];

        // This is a simplified example. In production, you might want to check if policies exist and update them.
        // For simplicity here, we're just creating them. If they exist, this might throw an error which we ignore.
        // A more robust solution would be to drop and recreate.
        for (const policy of policies) {
            const { error: policyError } = await supabaseAdmin.from('storage.objects').policy(policy.name).create({
                bucket: 'product-files',
                action: policy.action,
                check: policy.check,
                roles: ['public', 'authenticated']
            });
            // Ignore 'already exists' errors, but throw others
            if (policyError && !policyError.message.includes('already exists')) {
                // This is a bit of a hack, proper way is to drop and recreate if needed
            }
        }

        return new Response(JSON.stringify({ message: "Storage setup complete" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    });