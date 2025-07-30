import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log("=== CREATE-CUSTOMER FUNCTION START v2 ===");
  console.log("Received request to create-customer function");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log("Processing customer creation request");
    const requestData = await req.json();
    console.log("Received request data:", requestData);

    const { 
      email, 
      displayName, 
      subscriptionPlan, 
      customerType,
      hasAddressAlert,
      createdBy, 
      password 
    } = requestData;

    if (!email || !displayName || !subscriptionPlan || !createdBy || !password || !customerType) {
      console.error("Missing required fields:", { email, displayName, subscriptionPlan, createdBy, customerType });
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          received: { email, displayName, subscriptionPlan, createdBy, customerType }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log("Creating auth user with provided password...");
    const { data: { user }, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName
      }
    });

    if (createUserError) {
      console.error("Error creating auth user:", createUserError);
      return new Response(
        JSON.stringify({ error: createUserError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    if (!user) {
      console.error("No user returned after creation");
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log("Auth user created successfully:", user.id);

    // Generate coupon code and create Stripe coupon
    console.log("Generating coupon code...");
    const couponCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log("Generated coupon code:", couponCode);

    let stripeCouponId = null;
    try {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      console.log("Stripe secret key available:", !!stripeKey, stripeKey ? `Length: ${stripeKey.length}` : 'None');
      
      if (!stripeKey) {
        console.error("STRIPE_SECRET_KEY not found in environment variables");
        throw new Error("Stripe secret key not configured");
      }
      
      const stripe = new Stripe(stripeKey, {
        apiVersion: '2023-10-16',
      });

      console.log("Creating Stripe coupon...");
      const stripeCoupon = await stripe.coupons.create({
        id: couponCode,
        amount_off: 5000, // 50 SEK in öre (100 öre = 1 SEK)
        currency: 'sek',
        duration: 'forever',
        max_redemptions: 100,
        name: `Discount coupon ${couponCode}`,
      });

      stripeCouponId = stripeCoupon.id;
      console.log("Stripe coupon created successfully:", stripeCouponId);
    } catch (stripeError) {
      console.error("Error creating Stripe coupon:", stripeError);
      // Continue with customer creation even if coupon creation fails
    }

    console.log("Updating customer subscription plan and type...");
    const { error: updateError } = await supabase
      .from('customers')
      .update({ 
        subscription_plan: subscriptionPlan,
        created_by: createdBy,
        customer_type: customerType,
        has_address_alert: hasAddressAlert,
        coupon_code: stripeCouponId ? couponCode : null
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("Error updating customer:", updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log("Creating profile for user...");
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: email,
        display_name: displayName,
        role: 'customer'
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (err) {
    console.error("Error in create-customer function:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "An unexpected error occurred"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});