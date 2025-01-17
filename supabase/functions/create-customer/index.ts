import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSupabaseAdmin, createAuthUser } from "./auth.ts";
import { CustomerData, updateProfile, updateCustomerSubscription } from "./customer.ts";
import { generateAndSendActivationEmail } from "./email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-user-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const supabaseAdmin = createSupabaseAdmin();
    const customerData = await req.json() as CustomerData;
    const createdById = req.headers.get('x-user-id');

    // Create auth user
    const user = await createAuthUser(supabaseAdmin, customerData.email);

    // Update profile and customer data
    await updateProfile(supabaseAdmin, user.id, customerData.firstName, customerData.lastName);
    await updateCustomerSubscription(supabaseAdmin, user.id, customerData.subscriptionPlan, createdById!);

    // Generate and send activation email
    await generateAndSendActivationEmail(
      supabaseAdmin,
      customerData.email,
      customerData.firstName,
      req.headers.get("origin") || ""
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: user.id,
        message: "Customer created successfully and activation email sent."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("Error in create-customer function:", err);
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});