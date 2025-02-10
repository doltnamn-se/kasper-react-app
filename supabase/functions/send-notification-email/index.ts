
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationEmailRequest {
  email: string;
  title: string;
  message: string;
  type: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request to send-notification-email function");

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const requestData = await req.json();
    console.log("Raw request data:", JSON.stringify(requestData));

    const { email, title, message, type } = requestData as NotificationEmailRequest;
    console.log("Processing email request for:", { email, title, type, message });

    if (!email || !title || !message) {
      const errorMsg = "Missing required fields";
      console.error(errorMsg + ":", { email, title, message });
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      const errorMsg = "RESEND_API_KEY is not configured";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log("Initializing Resend with API key");
    const resend = new Resend(RESEND_API_KEY);

    // Determine the correct redirect URL based on notification type
    let redirectUrl = 'https://app.doltnamn.se';
    if (type === 'removal') {
      redirectUrl = 'https://app.doltnamn.se/deindexing';
    } else if (type === 'address_alert') {
      redirectUrl = 'https://app.doltnamn.se/address-alerts';
    } else if (type === 'monitoring') {
      redirectUrl = 'https://app.doltnamn.se/monitoring';
    }

    console.log("Attempting to send email...");
    const { data, error } = await resend.emails.send({
      from: 'Doltnamn.se <no-reply@doltnamn.se>',
      to: [email],
      subject: title,
      html: `
        <!DOCTYPE html>
        <html style="margin: 0; padding: 0; min-height: 100%; background-color: #f4f4f4 !important;">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            html, body {
              margin: 0;
              padding: 0;
              min-height: 100%;
              background-color: #f4f4f4 !important;
            }
            body {
              font-family: 'Roboto', sans-serif;
              line-height: 1.6;
              color: #333333;
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
            h1 {
              color: #333333;
              font-size: 24px;
              margin-bottom: 40px;
              text-align: center;
              font-weight: 700;
            }
            p {
              color: #333333;
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
              color: #333333;
              text-decoration: underline;
            }
          </style>
        </head>
        <body style="background-color: #f4f4f4 !important; margin: 0; padding: 0; min-height: 100%;">
          <div class="container">
            <div class="logo">
              <img src="https://app.doltnamn.se/lovable-uploads/doltnamn.se-logo-email-black.png" alt="Doltnamn Logo" style="margin: 0 auto; display: block;">
            </div>
            <div class="email-wrapper">
              <h1>${title}</h1>
              <p>${message}</p>
              <div style="text-align: center; margin-bottom: 40px;">
                <a href="${redirectUrl}" class="button">Gå till plattformen</a>
              </div>
              <p style="text-align: left;">
                Om du har några frågor, maila oss på <a href="mailto:support@doltnamn.se" class="email-link">support@doltnamn.se</a>.
              </p>
            </div>
          </div>
          <p style="text-align: center; color: #666666; font-size: 11px; margin-top: 15px; margin-bottom: 10px;">
            Skickat från teamet på <a href="https://doltnamn.se/" style="color: #666666; text-decoration: underline;">Doltnamn.se</a>
          </p>
          <p style="text-align: center; color: #666666; font-size: 11px; margin-top: 0; padding-bottom: 20px;">
            © ${new Date().getFullYear()} Doltnamn. Alla rättigheter förbehållna.
          </p>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw error;
    }

    console.log("Email sent successfully:", JSON.stringify(data));

    return new Response(
      JSON.stringify({ success: true, data }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Detailed error in send-notification-email function:", {
      message: error.message,
      stack: error.stack,
      details: error.response?.data || error
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error",
        details: error.response?.data || {},
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

