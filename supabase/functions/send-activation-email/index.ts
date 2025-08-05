import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { getActivationEmailTemplate } from "../email-handler/templates.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request) => {
  console.log("🚀 UPDATED activation email handler called - v2.0");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName, password } = await req.json();
    console.log("📧 Using NEW template system for:", email);
    
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

    console.log("✅ NEW activation email sent successfully:", data);

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