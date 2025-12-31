import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get API key from Vault
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: secretData, error: secretError } = await supabase
      .from('vault.decrypted_secrets')
      .select('decrypted_secret')
      .eq('name', 'CREEM_API_KEY')
      .single();
    
    if (secretError || !secretData) {
      throw new Error('CREEM_API_KEY not found in vault');
    }
    
    const CREEM_API_KEY = secretData.decrypted_secret;

    const { product_id, success_url, customer_email, metadata } = await req.json();

    if (!product_id) {
      throw new Error('product_id is required');
    }

    // Create checkout session with Creem API
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': CREEM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id,
        success_url: success_url || 'https://healpet.app/success',
        customer: customer_email ? { email: customer_email } : undefined,
        metadata: metadata || {},
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Creem API error: ${errorText}`);
    }

    const checkoutData = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: checkoutData.checkout_url,
        checkout_id: checkoutData.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
