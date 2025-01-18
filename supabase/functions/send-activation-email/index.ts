import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName } = await req.json();
    console.log("Sending activation email to:", email);

    if (!email) {
      throw new Error('Email is required');
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

    console.log("Generating magic link...");
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${req.headers.get('origin')}/onboarding`,
        data: {
          activationLink: true,
          expiresIn: 86400 // 24 hours in seconds
        }
      }
    });

    if (error) {
      console.error("Error generating magic link:", error);
      throw error;
    }

    if (!data.properties?.action_link) {
      throw new Error("No magic link generated");
    }

    console.log("Magic link generated successfully");

    // Send email via Resend
    console.log("Sending activation email via Resend");
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Doltnamn <no-reply@doltnamn.se>",
        to: [email],
        subject: "Activate Your Doltnamn Account",
        html: `
          <div>
            <h1>Welcome to Doltnamn, ${firstName}!</h1>
            <p>Your account has been created. Click the button below to set up your password and complete your onboarding:</p>
            <a href="${data.properties.action_link}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Activate Account
            </a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>${data.properties.action_link}</p>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Error sending email via Resend:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailData = await resendResponse.json();
    console.log("Activation email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, message: "Activation email sent successfully" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error("Error in send-activation-email function:", err);
    return new Response(
      JSON.stringify({ 
        error: err.message || "Failed to send activation email",
        details: err.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});