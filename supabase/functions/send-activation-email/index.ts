import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getActivationEmailTemplate } from "../../../src/utils/emailTemplates/activationEmail.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
        from: 'Doltnamn.se <no-reply@doltnamn.se>',
        to: [email],
        subject: 'Aktivera ditt konto',
        html: getActivationEmailTemplate(displayName, password),
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