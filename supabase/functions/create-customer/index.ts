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
    const { email, displayName, subscriptionPlan, createdBy } = await req.json();
    console.log("Creating customer with data:", { email, displayName, subscriptionPlan, createdBy });

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
    try {
      const emailHtml = `
        <h1>Welcome to Doltnamn!</h1>
        <p>Your account has been created. Here are your login credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${tempPassword}</p>
        <p>Please login and change your password.</p>
      `;

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        },
        body: JSON.stringify({
          from: "Doltnamn <no-reply@doltnamn.se>",
          to: [email],
          subject: "Welcome to Doltnamn - Your Account Details",
          html: emailHtml,
        }),
      });

      if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        console.error("Error sending welcome email:", errorText);
        // Don't throw here, as the user is already created
      }
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
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