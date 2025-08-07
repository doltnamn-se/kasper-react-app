// ============= PRODUCTION EMAIL TEMPLATE - DO NOT AUTO-OVERRIDE =============
// This file contains manually customized Kasper branding and Swedish localization
// Any automated changes should be carefully reviewed to preserve the design
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
const sharedEmailStyles = `
        html,
        body {
            margin: 0;
            padding: 0;
            min-height: 100%;
            background-color: #fafafa !important;
        }

        body {
            font-family: 'Google Sans', 'Segoe UI', 'Helvetica', sans-serif;
            line-height: 1.6;
            color: #121212;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px 20px;
            background-color: #fafafa !important;
        }

        .logo {
            text-align: center;
            margin-bottom: 15px;
            width: 100%;
            background-color: #fafafa !important;
        }

        .logo img {
            max-width: 100px;
            height: auto;
            margin: 0 auto;
            display: block;
        }

        .email-wrapper {
            background-color: #fafafa;
            border-radius: 0px;
            padding: 5px;
            margin: 0;
        }

        p {
            color: #121212;
            margin-bottom: 20px;
            font-size: 15px;
        }

        .button {
            display: inline-block;
            background-color: #121212;
            color: #ffffff !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 1rem;
            margin: 20px 0;
            font-weight: 500;
        }

        .button:hover {
            background-color: #303030;
        }

        .email-link {
            color: #121212;
            text-decoration: underline;
        }

        .credentials {
            background-color: #eeeeee;
            padding: 30px;
            border-radius: 15px;
            margin: 20px 0;
            text-align: center;
        }

        .password-label {
            font-size: 14px;
            color: #121212;
            margin-bottom: 10px;
            font-weight: 500;
        }

        .password-value {
            font-size: 24px;
            color: #121212;
            font-weight: 700;
            letter-spacing: 1px;
        }
`;
function getActivationEmailTemplate(displayName, password) {
  // Extract first name from display name (everything before the first space)
  const firstName = displayName.split(' ')[0];
  return `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aktivera ditt konto</title>
      <style>
        ${sharedEmailStyles}
      </style>
    </head>
<body style="background-color: #fafafa !important; margin: 0; padding: 0; min-height: 100%;">
    <div style="display: none; max-height: 0; overflow: hidden;">
        Hej ${firstName} 👋
        <br><br>
        Ditt konto har skapats och du kan nu logga in för att aktivera ditt konto.ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
    </div>
      <div class="container">
    <div class="logo">
      <img src="https://app.joinkasper.com/lovable-uploads/kasper-wp-logo.png" alt="Kasper Logo" style="margin: 0 auto; display: block; max-width: 100px; height: auto;">
    </div>
        <div class="email-wrapper">
            <h1 style="font-size: 20px; color: #121212; margin-bottom: 20px; text-align: center;">Aktivera ditt konto</h1>
            <p>
                Hej ${firstName} 👋
                <br><br>
                Ditt konto har skapats och du kan nu logga in för att aktivera ditt konto. Du loggar in med din e-postadress samt det lösenord vi genererat åt dig nedan.
            </p>
            <div class="credentials">
                <div class="password-label">Ditt lösenord</div>
                <div class="password-value">${password}</div>
            </div>
            <div style="text-align: center; margin-bottom: 40px;">
                <a href="https://app.joinkasper.com/auth" class="button">Aktivera ditt konto</a>
            </div>
            <p style="text-align: left;">
                Om du har några frågor eller behöver hjälp med att komma igång, maila
                oss på <a href="mailto:support@joinkasper.com" class="email-link">support@joinkasper.com</a>. Vi är glada att ha dig ombord!
            </p>
        </div>
    </div>
    <p style="text-align: center; color: #707070; font-size: 11px; margin-top: 15px; margin-bottom: 10px;">
        Skickat från teamet på <a href="https://joinkasper.com/" style="color: #707070; text-decoration: underline;">Kasper®</a>
    </p>
    <p style="text-align: center; color: #707070; font-size: 11px; margin-top: 0; padding-bottom: 20px;">
        &copy; 2025 Kasper®. Alla rättigheter förbehållna.
    </p>
</body>
    </html>
  `;
}
const handler = async (req)=>{
  console.log("🚀 KASPER ACTIVATION EMAIL - Updated template v4.1");
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { email, displayName, password } = await req.json();
    console.log("📧 Sending Kasper activation email to:", email);
    const emailHtml = getActivationEmailTemplate(displayName, password);
    const { data, error } = await resend.emails.send({
      from: "Kasper® <app@joinkasper.com>",
      to: email,
      subject: "Aktivera ditt konto",
      html: emailHtml
    });
    if (error) {
      console.error("Error sending activation email:", error);
      throw error;
    }
    console.log("✅ Kasper activation email sent successfully:", data);
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("Error in send-activation-email function:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
};
serve(handler);