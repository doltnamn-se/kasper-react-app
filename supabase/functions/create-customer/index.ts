import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, subscriptionPlan, createdBy } = await req.json();
    console.log("Creating customer with data:", { email, firstName, lastName, subscriptionPlan, createdBy });

    // Initialize Supabase admin client
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

    // Create auth user
    console.log("Creating auth user");
    const tempPassword = Math.random().toString(36).slice(-8);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      console.error("No user data returned from auth creation");
      throw new Error("Failed to create user");
    }

    console.log("Auth user created successfully:", authData.user.id);

    // Generate magic link for welcome email
    console.log("Generating magic link for welcome email");
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${new URL(req.url).origin}/onboarding`,
      }
    });

    if (magicLinkError || !magicLinkData?.properties?.action_link) {
      console.error("Error generating magic link:", magicLinkError);
      throw new Error("Failed to generate activation link");
    }

    // Send welcome email using our email handler
    console.log("Sending welcome email");
    const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/email-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        type: 'welcome',
        email: email,
        data: {
          firstName: firstName,
          resetLink: magicLinkData.properties.action_link,
        },
      }),
    });

    if (!emailResponse.ok) {
      console.error("Error sending welcome email:", await emailResponse.text());
      throw new Error("Failed to send welcome email");
    }

    console.log("Welcome email sent successfully");

    // Update profile data
    console.log("Updating profile data");
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        role: 'customer',
      })
      .eq('id', authData.user.id);

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
      })
      .eq('id', authData.user.id);

    if (customerError) {
      console.error("Error updating customer:", customerError);
      throw new Error("Failed to update customer");
    }

    console.log("Customer creation completed successfully");
    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authData.user.id,
        message: "Customer created successfully and activation email sent."
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