import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const sharedEmailStyles = `
  html, body {
    margin: 0;
    padding: 0;
    min-height: 100%;
    background-color: #f4f4f4 !important;
  }
  body {
    font-family: 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #121212;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px 20px;
    background-color: #f4f4f4 !important;
  }
  .logo {
    text-align: center;
    margin-bottom: 15px;
    width: 100%;
    background-color: #f4f4f4 !important;
  }
  .logo img {
    max-width: 150px;
    height: auto;
    margin: 0 auto;
    display: block;
  }
  .email-wrapper {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 40px;
    margin: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  p {
    color: #121212;
    margin-bottom: 20px;
    font-size: 16px;
  }
  .button {
    display: inline-block;
    background-color: #000000;
    color: #ffffff !important;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 4px;
    margin: 20px 0;
    font-weight: 500;
  }
  .button:hover {
    background-color: #333333;
  }
  .email-link {
    color: #121212;
    text-decoration: underline;
  }
  .credentials {
    background-color: #eeeeee;
    padding: 30px;
    border-radius: 4px;
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

function getActivationEmailTemplate(displayName: string, password: string): string {
  return `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aktivera ditt konto - Kasper</title>
      <style>
        ${sharedEmailStyles}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://upfapfohwnkiugvebujh.supabase.co/storage/v1/object/public/avatars/kasper-logo-app-light.svg" alt="Kasper" />
        </div>
        <div class="email-wrapper">
          <p>Hej ${displayName},</p>
          <p>Ditt konto har skapats! Här är dina inloggningsuppgifter:</p>
          <div class="credentials">
            <div class="password-label">Ditt tillfälliga lösenord:</div>
            <div class="password-value">${password}</div>
          </div>
          <p>Du kan logga in på <a href="https://app.joinkasper.com" class="email-link">app.joinkasper.com</a> med din e-post och detta lösenord.</p>
          <p>Vi rekommenderar att du byter lösenord direkt efter första inloggningen i inställningarna.</p>
          <p>Välkommen till Kasper!</p>
          <p>Med vänliga hälsningar,<br>Kasper-teamet</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request) => {
  console.log("🚀 EMBEDDED TEMPLATE activation email handler - v3.0");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName, password } = await req.json();
    console.log("📧 Using EMBEDDED NEW template for:", email);
    
    const emailHtml = getActivationEmailTemplate(displayName, password);

    const { data, error } = await resend.emails.send({
      from: "Kasper <app@joinkasper.com>",
      to: email,
      subject: "Aktivera ditt konto",
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending activation email:", error);
      throw error;
    }

    console.log("✅ EMBEDDED template activation email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-activation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);