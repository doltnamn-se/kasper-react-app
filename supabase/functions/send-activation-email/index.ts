import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
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
        redirectTo: `${req.headers.get('origin')}/onboarding/hiding-preferences`,
        data: {
          activationLink: true,
          expiresIn: 86400
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

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Doltnamn</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f6f6f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .email-wrapper {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo img {
            max-width: 150px;
            height: auto;
          }
          h1 {
            color: #161618;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
          }
          p {
            color: #4a4a4a;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background-color: #000000;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #333333;
          }
          .footer {
            text-align: center;
            color: #666666;
            font-size: 12px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-wrapper">
            <div class="logo">
              <img src="https://app.doltnamn.se/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png" alt="Doltnamn Logo">
            </div>
            <h1>Welcome to Doltnamn, ${firstName}!</h1>
            <p>Your account has been created. Click the button below to access your account and complete your onboarding:</p>
            <div style="text-align: center;">
              <a href="${data.properties.action_link}" class="button">Access Your Account</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; font-size: 12px; color: #666666;">${data.properties.action_link}</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Doltnamn. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

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
        subject: "Welcome to Doltnamn - Access Your Account",
        html: emailHtml,
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