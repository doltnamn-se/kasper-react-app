import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log("=== TEST STRIPE COUPON FUNCTION ===");
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    console.log("Stripe key available:", !!stripeKey);
    console.log("Stripe key length:", stripeKey ? stripeKey.length : 0);
    console.log("Stripe key starts with sk_:", stripeKey ? stripeKey.startsWith('sk_') : false);
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not found");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Generate test coupon
    const couponCode = "TEST" + Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log("Generating test coupon:", couponCode);

    const stripeCoupon = await stripe.coupons.create({
      id: couponCode,
      amount_off: 5000, // 50 SEK in öre
      currency: 'sek',
      duration: 'forever',
      max_redemptions: 1,
      name: `Test coupon ${couponCode}`,
    });

    console.log("Test coupon created successfully:", stripeCoupon.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        coupon: stripeCoupon.id,
        message: "Test coupon created successfully"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (err) {
    console.error("Error in test-stripe-coupon:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});