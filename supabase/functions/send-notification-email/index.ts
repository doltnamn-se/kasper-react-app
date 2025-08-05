import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { getNotificationEmailTemplate } from "../email-handler/templates.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  title: string;
  message: string;
  type: string;
  isAdminAddedLink?: boolean;
  forceEmail?: boolean;
}

const handler = async (req: Request) => {
  console.log("🚀 UPDATED notification email handler called - v2.0");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: EmailRequest = await req.json();
    const { email, title, message, type, isAdminAddedLink, forceEmail } = requestData;
    
    console.log("📧 Using NEW template system for notification:", { 
      email, 
      title, 
      type,
      hasResendKey: !!Deno.env.get("RESEND_API_KEY")
    });
    
    if (!email) {
      console.error("No email address provided");
      throw new Error("No email address provided");
    }
    
    const htmlContent = getNotificationEmailTemplate(title, message);

    console.log("Attempting to send email with NEW template...");
    
    const { data, error } = await resend.emails.send({
      from: "Kasper <app@joinkasper.com>",
      to: email,
      subject: title,
      html: htmlContent,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("✅ NEW notification email sent successfully to:", email);

    return new Response(JSON.stringify({ 
      success: true, 
      data,
      message: `Email sent successfully to ${email}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        stack: error.stack 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);