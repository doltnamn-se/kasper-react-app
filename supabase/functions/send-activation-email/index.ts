
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";
import { getActivationEmailTemplate } from "../_shared/emailTemplates.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName, password } = await req.json();

    const { data, error } = await resend.emails.send({
      from: "Digitaltskydd.se <onboarding@resend.dev>",
      to: email,
      subject: "Välkommen till Digitaltskydd.se – Aktivera ditt konto",
      html: getActivationEmailTemplate(displayName, password),
    });

    if (error) {
      console.error("Error sending activation email:", error);
      throw error;
    }

    console.log("Activation email sent successfully:", data);

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
});
