import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    console.log("Starting email send process...");
    console.log("Target email:", email);
    console.log("RESEND_API_KEY status:", RESEND_API_KEY ? "Present" : "Missing");

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!email) {
      throw new Error("Email address is required");
    }

    console.log("Making request to Resend API...");
    
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Doltnamn <no-reply@app.doltnamn.se>",
        to: [email],
        subject: "Test Email from Doltnamn",
        html: "<p>This is a test email from Doltnamn. If you received this, the email functionality is working correctly!</p>",
      }),
    });

    const data = await res.json();
    console.log("Resend API response:", data);

    if (!res.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in send-test-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error occurred",
        statusCode: 500,
        name: "server_error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);