import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createSupabaseAdmin } from "./auth.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, displayName, subscriptionPlan, createdBy } = await req.json();
    console.log("Creating customer with data:", { email, displayName, subscriptionPlan, createdBy });

    const supabaseAdmin = createSupabaseAdmin();

    // Generate a secure random password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    // Step 1: Create auth user
    console.log("Creating auth user...");
    const { data: { user }, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (createUserError || !user) {
      console.error("Error creating auth user:", createUserError);
      throw createUserError || new Error("Failed to create user");
    }

    // Step 2: Update profile
    console.log("Updating profile...");
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        display_name: displayName,
        email: email,
        role: 'customer'
      })
      .eq('id', user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      throw profileError;
    }

    // Step 3: Update customer record
    console.log("Updating customer record...");
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
      throw customerError;
    }

    // Step 4: Send welcome email
    console.log("Sending welcome email...");
    const { error: emailError } = await supabaseAdmin.functions.invoke('send-activation-email', {
      body: {
        email,
        displayName,
        password: tempPassword
      }
    });

    if (emailError) {
      console.warn("Warning: Error sending welcome email:", emailError);
      // Don't throw here, as the user is already created
    }

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