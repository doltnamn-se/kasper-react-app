import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { getPasswordResetTemplate } from "../email-handler/templates.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request) => {
  console.log("🚀 UPDATED password reset handler called - v2.0");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink } = await req.json();
    console.log("📧 Using NEW template system for password reset:", email);
    
    const emailHtml = getPasswordResetTemplate(resetLink);

    const { data, error } = await resend.emails.send({
      from: "Kasper <app@joinkasper.com>",
      to: email,
      subject: "Återställ ditt lösenord – Kasper",
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }

    console.log("✅ NEW password reset email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-password-reset function:", error);
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