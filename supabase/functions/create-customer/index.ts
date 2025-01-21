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
    console.log('Starting customer creation process...');
    const { email, displayName, subscriptionPlan, createdBy, password } = await req.json();

    // Validate input
    if (!email || !displayName || !subscriptionPlan || !password) {
      console.error('Missing required fields:', { email, displayName, subscriptionPlan, password });
      throw new Error("Missing required fields");
    }

    console.log('Creating auth user...');
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { displayName }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      throw authError;
    }

    if (!authData.user) {
      console.error('No user data returned from auth creation');
      throw new Error("Failed to create auth user");
    }

    console.log('Auth user created successfully:', authData.user.id);

    // Step 2: Create customer record
    console.log('Creating customer record...');
    const { error: customerError } = await supabase
      .from('customers')
      .insert([{
        id: authData.user.id,
        subscription_plan: subscriptionPlan,
        created_by: createdBy || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (customerError) {
      console.error('Error creating customer record:', customerError);
      // Attempt to clean up the auth user if customer creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw customerError;
    }

    console.log('Customer created successfully');
    return addCorsHeaders(new Response(
      JSON.stringify({ 
        message: "Customer created successfully",
        userId: authData.user.id 
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    ));

  } catch (error) {
    console.error('Error in customer creation process:', error);
    return addCorsHeaders(new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        details: error.details || null
      }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    ));
  }
});