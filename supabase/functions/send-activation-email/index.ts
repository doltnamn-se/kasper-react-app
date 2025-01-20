import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://upfapfohwnkiugvebujh.supabase.co',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { email, displayName, password } = await req.json();

    if (!email || !displayName || !password) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields",
          received: { email, displayName }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log("Sending activation email to:", email);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Doltnamn</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 5px;
              padding: 20px;
              margin-top: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .credentials {
              background-color: #fff;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Doltnamn!</h1>
            </div>
            
            <p>Hello ${displayName},</p>
            
            <p>Your account has been created successfully. Here are your login credentials:</p>
            
            <div class="credentials">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
            </div>
            
            <p>For security reasons, we recommend changing your password after your first login.</p>
            
            <p>You can log in to your account using the button below:</p>
            
            <a href="https://app.doltnamn.se/auth" class="button">Log In to Your Account</a>
            
            <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The Doltnamn Team</p>
          </div>
        </body>
      </html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Doltnamn <no-reply@doltnamn.se>',
        to: email,
        subject: 'Welcome to Doltnamn - Your Account Details',
        html: emailHtml
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error from Resend API:", errorData);
      throw new Error(`Failed to send email: ${errorData.message || 'Unknown error'}`);
    }

    console.log("Welcome email sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, message: "Welcome email sent successfully" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (err) {
    console.error("Error in send-activation-email function:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to send welcome email" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});