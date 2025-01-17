import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-user-id",
};

interface CreateCustomerPayload {
  email: string;
  firstName: string;
  lastName: string;
  subscriptionPlan: "1_month" | "6_months" | "12_months";
}

serve(async (req: Request) => {
  console.log("Received request to create-customer function");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Initializing Supabase admin client");
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { email, firstName, lastName, subscriptionPlan } = await req.json() as CreateCustomerPayload;
    console.log("Received customer data:", { email, firstName, lastName, subscriptionPlan });

    // Create auth user with a random password
    const tempPassword = Math.random().toString(36).slice(-8);
    console.log("Creating auth user for:", email);
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!authData.user) {
      console.error("No user data returned from auth creation");
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Auth user created successfully:", authData.user.id);

    // Update profile
    console.log("Updating user profile");
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
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: "Failed to update profile" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Profile updated successfully");

    // Update customer subscription plan
    console.log("Updating customer subscription plan");
    const { error: customerError } = await supabaseAdmin
      .from('customers')
      .update({
        subscription_plan: subscriptionPlan,
        created_by: req.headers.get('x-user-id'),
      })
      .eq('id', authData.user.id);

    if (customerError) {
      console.error("Error updating customer:", customerError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: "Failed to update customer" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Customer subscription plan updated successfully");

    // Generate magic link
    console.log("Generating magic link");
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${req.headers.get("origin")}/onboarding`,
      }
    });

    if (magicLinkError || !magicLinkData.properties?.action_link) {
      console.error("Error generating magic link:", magicLinkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate activation link" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Magic link generated successfully");

    // Send activation email
    try {
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

    } catch (emailError) {
      console.error("Error in email sending:", emailError);
    }

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
      JSON.stringify({ error: "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});