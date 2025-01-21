import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleOptionsRequest, addCorsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS preflight requests
  const optionsResponse = handleOptionsRequest(req);
  if (optionsResponse) return optionsResponse;

  try {
    const { email, displayName, subscriptionPlan, createdBy, password } = await req.json();

    // Validate input
    if (!email || !displayName || !subscriptionPlan || !createdBy || !password) {
      throw new Error("Missing required fields");
    }

    // Step 1: Create customer in the database
    const { data, error } = await supabase
      .from('customers')
      .insert([{ email, displayName, subscriptionPlan, createdBy }]);

    if (error) {
      throw error;
    }

    // Step 2: Create auth user
    const { user, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { displayName },
    });

    if (authError) {
      throw authError;
    }

    // Return success response
    const result = { message: "Customer created successfully", userId: user.id };
    return addCorsHeaders(new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
  } catch (error) {
    // Add CORS headers to the error response
    return addCorsHeaders(new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }));
  }
});