import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailRequest {
  type: 'reset_password' | 'welcome' | 'test';
  email: string;
  data?: {
    firstName?: string;
    resetLink?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, data } = await req.json() as EmailRequest;
    console.log("Processing email request:", { type, email, data });

    // Initialize Supabase admin client for auth operations
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

    let emailContent;
    let subject;

    // Generate appropriate email content based on type
    switch (type) {
      case 'reset_password':
        console.log("Generating reset password link");
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: `${new URL(req.url).origin}/auth/reset-password`,
          }
        });

        if (linkError) {
          console.error("Error generating reset link:", linkError);
          throw new Error("Failed to generate reset link");
        }

        subject = "Reset Your Doltnamn Password";
        emailContent = `
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
        `;
        break;

      case 'welcome':
        subject = "Welcome to Doltnamn";
        emailContent = `
          <div>
            <h1>Welcome to Doltnamn, ${data?.firstName}!</h1>
            <p>Your account has been created. Click the button below to set up your password and complete your onboarding:</p>
            <a href="${data?.resetLink}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Activate Account
            </a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>${data?.resetLink}</p>
          </div>
        `;
        break;

      case 'test':
        subject = "Test Email from Doltnamn";
        emailContent = "<p>This is a test email from Doltnamn. If you received this, the email functionality is working correctly!</p>";
        break;

      default:
        throw new Error("Invalid email type");
    }

    if (!Deno.env.get("RESEND_API_KEY")) {
      throw new Error("RESEND_API_KEY is not set");
    }

    console.log("Sending email via Resend");
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Doltnamn <no-reply@doltnamn.se>",
        to: [email],
        subject: subject,
        html: emailContent,
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
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error in email-handler function:", err);
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