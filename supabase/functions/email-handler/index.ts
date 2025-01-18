import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getPasswordResetTemplate, getWelcomeTemplate, getTestEmailTemplate } from "./templates.ts";

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, data } = await req.json() as EmailRequest;
    console.log("Processing email request:", { type, email, data });

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
        emailContent = getPasswordResetTemplate(linkData.properties.action_link);
        break;

      case 'welcome':
        subject = "Welcome to Doltnamn";
        emailContent = getWelcomeTemplate(data?.firstName || '', data?.resetLink || '');
        break;

      case 'test':
        subject = "Test Email from Doltnamn";
        emailContent = getTestEmailTemplate();
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