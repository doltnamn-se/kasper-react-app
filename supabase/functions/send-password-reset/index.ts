import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleOptionsRequest, addCorsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  const optionsResponse = handleOptionsRequest(req);
  if (optionsResponse) return optionsResponse;

  try {
    const { email, resetLink } = await req.json();

    if (!email || !resetLink) {
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
        subject: 'Password Reset Request - Doltnamn',
        html: `
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the link below to reset it:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
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
    console.error('Error in send-password-reset:', error);
    return addCorsHeaders(new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }));
  }
});