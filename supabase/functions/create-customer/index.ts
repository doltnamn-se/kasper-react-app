import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log the raw request body for debugging
    const rawBody = await req.text();
    console.log("Raw request body:", rawBody);

    // Parse the JSON body
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid JSON in request body",
          details: parseError.message 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { email, displayName, subscriptionPlan, createdBy } = body;
    console.log("Parsed customer data:", { email, displayName, subscriptionPlan, createdBy });

    // Validate required fields
    if (!email || !displayName || !subscriptionPlan || !createdBy) {
      console.error("Missing required fields:", { email, displayName, subscriptionPlan, createdBy });
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          details: { email, displayName, subscriptionPlan, createdBy }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate password
    const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    console.log("Generated password for new user");

    // Create auth user
    console.log("Creating auth user with email:", email);
    const { data: { user }, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
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