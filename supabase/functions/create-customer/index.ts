import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get and log the request body
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);

    let body;
    try {
      body = JSON.parse(requestBody);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Parsed request body:", body);

    const { email, displayName, subscriptionPlan, createdBy } = body;
    
    // Log all input values
    console.log("Processing customer creation with:", {
      email,
      displayName,
      subscriptionPlan,
      createdBy
    });

    // Validate required fields
    if (!email) console.log("Missing email");
    if (!displayName) console.log("Missing displayName");
    if (!subscriptionPlan) console.log("Missing subscriptionPlan");
    if (!createdBy) console.log("Missing createdBy");

    if (!email || !displayName || !subscriptionPlan || !createdBy) {
      const errorResponse = {
        error: "Missing required fields",
        details: {
          email: email || "missing",
          displayName: displayName || "missing",
          subscriptionPlan: subscriptionPlan || "missing",
          createdBy: createdBy || "missing"
        }
      };
      console.error("Validation failed:", errorResponse);
      return new Response(
        JSON.stringify(errorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Initialize Supabase admin client
    console.log("Initializing Supabase admin client");
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create auth user
    console.log("Creating auth user with email:", email);
    const { data: { user }, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12),
      email_confirm: true,
      user_metadata: {
        display_name: displayName
      }
    });

    if (createUserError || !user) {
      console.error("Error creating auth user:", createUserError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create user",
          details: createUserError 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Auth user created successfully:", user.id);

    // Update profile data
    console.log("Updating profile for user:", user.id);
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        display_name: displayName,
        email: email,
        role: 'customer',
      })
      .eq('id', user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to update profile",
          details: profileError 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Update customer data
    console.log("Updating customer data for user:", user.id);
    const { error: customerError } = await supabaseAdmin
      .from('customers')
      .update({
        subscription_plan: subscriptionPlan,
        created_by: createdBy,
        onboarding_completed: true,
        onboarding_step: 5
      })
      .eq('id', user.id);

    if (customerError) {
      console.error("Error updating customer:", customerError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to update customer",
          details: customerError 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Customer creation completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: user.id,
        message: "Customer created successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error in create-customer function:", err);
    return new Response(
      JSON.stringify({ 
        error: err.message || "An unexpected error occurred",
        details: err.toString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});