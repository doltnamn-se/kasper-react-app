
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: "Digitaltskydd <no-reply@digitaltskydd.se>",
      to: [email],
      subject: "Välkommen till Digitaltskydd",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Digitaltskydd</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Välkommen ${displayName}!</h2>
            <p>Ditt konto har skapats och du kan nu logga in på Digitaltskydd.</p>
            <p>Dina inloggningsuppgifter är:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
              <p><strong>E-post:</strong> ${email}</p>
              <p><strong>Lösenord:</strong> ${password}</p>
            </div>
            <p style="margin-top: 20px;">
              <a href="https://app.digitaltskydd.se/auth" 
                 style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Logga in här
              </a>
            </p>
            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
              Om du har några frågor, tveka inte att kontakta oss.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8em; color: #999;">
              Detta är ett automatiskt meddelande, vänligen svara inte på detta mail.
            </p>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Welcome email sent successfully:", data);
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
