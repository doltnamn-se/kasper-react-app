import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.doltnamn.se',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  console.log("Received request to send-activation-email function");

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { email, displayName, password } = await req.json();
    console.log("Processing email request for:", email);

    if (!email || !displayName || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Doltnamn <no-reply@doltnamn.se>',
        to: [email],
        subject: 'Välkommen till Doltnamn - Dina inloggningsuppgifter',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Välkommen till Doltnamn</title>
            <style>
              body {
                font-family: Arial, Helvetica, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                color: #333333;
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
                max-width: 200px;
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
              .credentials {
                background-color: #f9f9f9;
                padding: 20px;
                border-radius: 4px;
                margin: 20px 0;
                border-left: 4px solid #000000;
              }
              .button {
                display: inline-block;
                background-color: #000000;
                color: #ffffff !important;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 4px;
                margin: 20px 0;
                font-weight: bold;
              }
              .button:hover {
                background-color: #333333;
              }
              .footer {
                text-align: center;
                color: #666666;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eeeeee;
              }
              .security-notice {
                font-size: 14px;
                color: #666666;
                padding: 15px;
                border-radius: 4px;
                background-color: #fff9e6;
                border: 1px solid #ffe5b4;
                margin: 20px 0;
              }
              .security-notice:before {
                content: "⚠️";
                margin-right: 8px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="email-wrapper">
                <div class="logo">
                  <img src="https://app.doltnamn.se/lovable-uploads/a60e3543-e8d5-4f66-a2eb-97eeedd073ae.png" alt="Doltnamn Logo">
                </div>
                <h1>Välkommen till Doltnamn, ${displayName}!</h1>
                <p>Ditt konto har skapats. Här är dina inloggningsuppgifter:</p>
                <div class="credentials">
                  <p><strong>E-post:</strong> ${email}</p>
                  <p><strong>Lösenord:</strong> ${password}</p>
                </div>
                <div style="text-align: center;">
                  <a href="https://app.doltnamn.se/auth" class="button">Logga in på ditt konto</a>
                </div>
                <div class="security-notice">
                  Av säkerhetsskäl rekommenderar vi att du ändrar ditt lösenord efter din första inloggning.
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Doltnamn. Alla rättigheter förbehållna.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Error sending email:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to send welcome email" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log("Welcome email sent successfully");
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (err) {
    console.error("Error in send-activation-email function:", err);
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});