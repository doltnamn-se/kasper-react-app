import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log("Activation email function invoked");

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { email, firstName } = await req.json();
    console.log("Received request to send activation email to:", email);

    // Generate magic link using Supabase admin client
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

    console.log("Generating magic link");
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${req.headers.get('origin')}/onboarding`,
      }
    });

    if (magicLinkError || !magicLinkData.properties?.action_link) {
      console.error("Error generating magic link:", magicLinkError);
      throw new Error("Failed to generate activation link");
    }

    console.log("Magic link generated successfully");

    try {
      console.log("Sending activation email");
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Doltnamn <no-reply@doltnamn.se>",
          to: [email],
          subject: "Aktivera ditt Doltnamn-konto",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Aktivera ditt konto</title>
                <style>
                  body {
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.5;
                    margin: 0;
                    padding: 0;
                    background-color: #f9fafb;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }
                  .logo {
                    text-align: center;
                    margin-bottom: 32px;
                  }
                  .logo img {
                    height: 40px;
                  }
                  h1 {
                    color: #111827;
                    font-size: 24px;
                    font-weight: 600;
                    text-align: center;
                    margin-bottom: 24px;
                  }
                  p {
                    color: #374151;
                    font-size: 16px;
                    margin-bottom: 24px;
                    text-align: center;
                  }
                  .button {
                    display: block;
                    width: fit-content;
                    margin: 32px auto;
                    padding: 12px 24px;
                    background-color: #000000;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 500;
                    text-align: center;
                  }
                  .button:hover {
                    background-color: #1a1a1a;
                  }
                  .footer {
                    margin-top: 48px;
                    padding-top: 24px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                    text-align: center;
                  }
                  .link {
                    color: #000000;
                    word-break: break-all;
                    text-align: center;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="logo">
                    <img src="https://app.doltnamn.se/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png" alt="doltnamn.se" />
                  </div>
                  <h1>Välkommen till Doltnamn, ${firstName}!</h1>
                  <p>Ditt konto har skapats. Klicka på knappen nedan för att komma igång med din digitala integritet:</p>
                  <a href="${magicLinkData.properties.action_link}" class="button">Aktivera mitt konto</a>
                  <p style="font-size: 14px; color: #6b7280;">Om knappen inte fungerar kan du kopiera och klistra in denna länk i din webbläsare:</p>
                  <p class="link">${magicLinkData.properties.action_link}</p>
                  <div class="footer">
                    © ${new Date().getFullYear()} Doltnamn. Alla rättigheter förbehållna.
                  </div>
                </div>
              </body>
            </html>
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

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (emailError) {
      console.error("Error in email sending:", emailError);
      throw emailError;
    }
  } catch (err) {
    console.error("Error in activation email function:", err);
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});