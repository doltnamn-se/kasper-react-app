
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { getNotificationEmailTemplate } from "../_shared/emailTemplates.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request) => {
  console.log("Send notification email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { email, title, message, type, isAdminAddedLink, forceEmail } = requestData;
    
    console.log("Email notification request details:", { 
      email, 
      title, 
      message, 
      type,
      isAdminAddedLink,
      forceEmail,
      hasResendKey: !!Deno.env.get("RESEND_API_KEY")
    });
    
    if (!email) {
      console.error("No email address provided");
      throw new Error("No email address provided");
    }
    
    // Generate email HTML using our template
    const htmlContent = getNotificationEmailTemplate(title, message);

    const { data, error } = await resend.emails.send({
      from: "Digitaltskydd.se <app@digitaltskydd.se>",
      to: email,
      subject: title,
      html: htmlContent,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Email sent successfully to:", email);
    console.log("Email response data:", data);

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
