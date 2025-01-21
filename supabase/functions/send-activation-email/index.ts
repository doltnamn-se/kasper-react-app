import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleOptionsRequest, addCorsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  const optionsResponse = handleOptionsRequest(req);
  if (optionsResponse) return optionsResponse;

  try {
    const { email, displayName, password } = await req.json();

    if (!email || !displayName || !password) {
      throw new Error('Missing required fields');
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Doltnamn <no-reply@doltnamn.se>',
        to: [email],
        subject: 'Welcome to Doltnamn - Your Account Details',
        html: `
          <p>Hello ${displayName},</p>
          <p>Your account has been created successfully. Here are your login credentials:</p>
          <p>Email: ${email}</p>
          <p>Password: ${password}</p>
          <p>Please login at <a href="https://app.doltnamn.se/auth">https://app.doltnamn.se/auth</a></p>
          <p>For security reasons, we recommend changing your password after your first login.</p>
          <p>Best regards,<br>The Doltnamn Team</p>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send email');
    }

    return addCorsHeaders(new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
  } catch (error) {
    console.error('Error in send-activation-email:', error);
    return addCorsHeaders(new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }));
  }
});