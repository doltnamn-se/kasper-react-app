
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

    console.log("Attempting to send email...");
    const { data, error } = await resend.emails.send({
      from: 'Doltnamn.se <no-reply@doltnamn.se>',
      to: [email],
      subject: title,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: #f4f4f4;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .content {
                color: #333333;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="https://app.doltnamn.se/lovable-uploads/doltnamn.se-logo-email-black.png" alt="Doltnamn Logo" style="max-width: 150px;">
              </div>
              <div class="content">
                <h2>${title}</h2>
                <p>${message}</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} Doltnamn. Alla rättigheter förbehållna.</p>
              </div>
            </div>
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
