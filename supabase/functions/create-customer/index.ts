import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  console.log("Function invoked with request:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { email, displayName, subscriptionPlan, createdBy } = await req.json();
    console.log("Starting customer creation with data:", { email, displayName, subscriptionPlan, createdBy });

    // Initialize Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Generate a random password
    const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    console.log("Generated password for new user");

    // Create auth user with provided email and password
    console.log("Creating auth user");
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
      throw new Error(createUserError?.message || "Failed to create user");
    }

    console.log("Auth user created successfully:", user.id);

    // Update profile data
    console.log("Updating profile data");
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
      throw new Error("Failed to update profile");
    }

    // Update customer data
    console.log("Updating customer data");
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
      throw new Error("Failed to update customer");
    }

    // Send welcome email
    console.log("Sending welcome email");
    const { error: emailError } = await supabaseAdmin.functions.invoke('send-activation-email', {
      body: {
        email,
        displayName,
        password
      }
    });

    if (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't throw error, just log it as this is not critical
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
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});