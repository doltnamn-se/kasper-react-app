import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  console.log("Edge Function received request:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    console.log("Processing customer creation request");
    const { email, displayName, subscriptionPlan, createdBy } = await req.json();
    console.log("Received data:", { email, displayName, subscriptionPlan, createdBy });

    // Initialize Supabase admin client with specific configuration
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );

    // Generate a secure random password
    const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);

    // Step 1: Create auth user with specific options
    console.log("Creating auth user...");
    const { data: { user }, error: createUserError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName
      }
    });

    if (createUserError) {
      console.error("Error creating auth user:", createUserError);
      throw createUserError;
    }

    if (!user) {
      console.error("No user returned after creation");
      throw new Error("Failed to create user");
    }

    console.log("Auth user created successfully:", user.id);

    // Step 2: Create profile
    console.log("Creating profile...");
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
      throw profileError;
    }

    console.log("Profile created successfully");

    // Step 3: Create customer record
    console.log("Creating customer record...");
    const { error: customerError } = await supabase
      .from('customers')
      .insert({
        id: user.id,
        subscription_plan: subscriptionPlan,
        created_by: createdBy,
        onboarding_completed: false,
        onboarding_step: 1
      });

    if (customerError) {
      console.error("Error creating customer:", customerError);
      throw customerError;
    }

    console.log("Customer record created successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Customer created successfully",
        userId: user.id 
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
        error: err.message || "An error occurred while creating the customer"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});