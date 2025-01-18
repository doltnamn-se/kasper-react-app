import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailRequest {
  email: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json() as EmailRequest;
    console.log("Processing password reset request for:", email);

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

    // Generate password reset link with the correct redirect URL
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://app.doltnamn.se/auth/reset-password',
      }
    });

    if (linkError) {
      console.error("Error generating reset link:", linkError);
      throw new Error("Failed to generate reset link");
    }

    console.log("Generated reset link:", linkData.properties.action_link);

    // Send email via Resend
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
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Reset Your Doltnamn Password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #f6f6f4;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://app.doltnamn.se/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png" alt="Doltnamn Logo" style="height: 40px;">
              </div>
              <div style="background: white; border-radius: 8px; padding: 30px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h1 style="margin: 0 0 20px; color: #000; font-size: 24px; font-weight: 600;">Reset Your Password</h1>
                <p style="margin: 0 0 20px; color: #374151; line-height: 1.5;">We received a request to reset your Doltnamn password. Click the button below to choose a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${linkData.properties.action_link}" style="display: inline-block; background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Reset Password</a>
                </div>
                <p style="margin: 20px 0 0; color: #6B7280; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email.</p>
                <p style="margin: 20px 0 0; color: #6B7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="margin: 10px 0 0; color: #6B7280; font-size: 14px; word-break: break-all;">${linkData.properties.action_link}</p>
              </div>
              <div style="text-align: center; color: #6B7280; font-size: 12px;">
                <p>&copy; ${new Date().getFullYear()} Doltnamn. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Error sending email:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailData = await resendResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, message: "Password reset email sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error in password-reset function:", err);
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