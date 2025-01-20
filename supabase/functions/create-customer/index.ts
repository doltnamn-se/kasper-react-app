import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting customer creation process...");
    const { email, displayName, subscriptionPlan, createdBy } = await req.json();
    console.log("Received data:", { email, displayName, subscriptionPlan, createdBy });

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Step 1: Create auth user with admin rights
    console.log("Creating auth user...");
    const { data: { user }, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: crypto.randomUUID().slice(0, 16), // Generate a secure random password
      email_confirm: true
    });

    if (createUserError || !user) {
      console.error("Error creating auth user:", createUserError);
      throw createUserError || new Error("Failed to create user");
    }
    console.log("Auth user created successfully:", user.id);

    // Step 2: Create profile
    console.log("Creating profile...");
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        email,
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
    const { error: customerError } = await supabaseAdmin
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