import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName } = await req.json();
    console.log("Sending activation email to:", email);

    if (!email) {
      throw new Error('Email is required');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log("Generating magic link...");
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${req.headers.get('origin')}/onboarding`,
        data: {
          activationLink: true,
          expiresIn: 86400 // 24 hours in seconds
        }
      }
    });

    if (error) {
      console.error("Error generating magic link:", error);
      throw error;
    }

    console.log("Magic link generated successfully");
    return new Response(
      JSON.stringify({ success: true, message: "Activation email sent successfully" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error("Error in send-activation-email function:", err);
    return new Response(
      JSON.stringify({ 
        error: err.message || "Failed to send activation email",
        details: err.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});