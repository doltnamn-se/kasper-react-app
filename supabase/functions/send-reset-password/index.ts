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
    const { email } = await req.json();
    console.log("Processing password reset for email:", email);

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

    // Generate reset password link
    console.log("Generating reset password link");
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${new URL(req.url).origin}/auth/reset-password`,
      }
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Error generating reset link:", linkError);
      throw new Error("Failed to generate reset link");
    }

    console.log("Reset link generated successfully");

    // Send email using Resend
    console.log("Sending reset password email");
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Doltnamn <no-reply@doltnamn.se>",
        to: [email],
        subject: "Reset Your Doltnamn Password",
        html: `
          <div>
            <h1>Password Reset Request</h1>
            <p>We received a request to reset your Doltnamn password. Click the button below to set a new password:</p>
            <a href="${linkData.properties.action_link}" style="display: inline-block; background-color: #000000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Reset Password
            </a>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>${linkData.properties.action_link}</p>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Error sending reset email:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailData = await resendResponse.json();
    console.log("Reset password email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset email sent successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error in send-reset-password function:", err);
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