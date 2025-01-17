import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting customer creation process");
    
    // Initialize Supabase client
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

    // Parse request body
    const { email, firstName, lastName, subscriptionPlan, createdBy } = await req.json();
    console.log("Request data:", { email, firstName, lastName, subscriptionPlan, createdBy });

    if (!email || !createdBy) {
      console.error("Missing required fields");
      throw new Error("Email and createdBy are required");
    }

    // Create auth user
    console.log("Creating auth user");
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: crypto.randomUUID(),
    });

    if (authError || !authData.user) {
      console.error("Error creating auth user:", authError);
      throw new Error(authError?.message || "Failed to create user");
    }
    console.log("Auth user created:", authData.user.id);

    // Update profile
    console.log("Updating profile");
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

    // Generate magic link
    console.log("Generating magic link");
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

    // Send activation email using Resend
    console.log("Sending activation email");
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Doltnamn <no-reply@doltnamn.se>",
        to: [email],
        subject: "Activate Your Doltnamn Account",
        html: `
          <div>
            <h1>Welcome to Doltnamn, ${firstName}!</h1>
            <p>Your account has been created. Click the button below to set up your password and complete your onboarding:</p>
            <a href="${magicLinkData.properties.action_link}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Activate Account
            </a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>${magicLinkData.properties.action_link}</p>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Error sending activation email:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailData = await resendResponse.json();
    console.log("Activation email sent successfully:", emailData);

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