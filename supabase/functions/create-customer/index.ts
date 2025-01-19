import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Allow all origins for development
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  console.log("Function invoked with request:", req.method);
  console.log("Request origin:", req.headers.get("origin"));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { email, displayName, subscriptionPlan, createdBy, password } = await req.json();
    console.log("Starting customer creation with data:", { email, displayName, subscriptionPlan, createdBy });

    if (!email || !displayName || !subscriptionPlan || !createdBy || !password) {
      console.error("Missing required fields:", { email, displayName, subscriptionPlan, createdBy, password });
      throw new Error("Missing required fields");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create auth user with provided password
    console.log("Creating auth user");
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName
      }
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    if (!authData.user) {
      console.error("No user data returned from auth creation");
      throw new Error("Failed to create user - no user data returned");
    }

    console.log("Auth user created successfully:", authData.user.id);

    // Update profile data with email and display name
    console.log("Updating profile data");
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        display_name: displayName,
        email: email,
        role: 'customer',
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    // Update customer data
    console.log("Updating customer data");
    const { error: customerError } = await supabaseAdmin
      .from('customers')
      .update({
        subscription_plan: subscriptionPlan,
        created_by: createdBy,
      })
      .eq('id', authData.user.id);

    if (customerError) {
      console.error("Error updating customer:", customerError);
      throw new Error(`Failed to update customer: ${customerError.message}`);
    }

    console.log("Customer creation completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authData.user.id,
        message: "Customer created successfully"
      }),
      {
        headers: corsHeaders,
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
        headers: corsHeaders,
        status: 400,
      }
    );
  }
});