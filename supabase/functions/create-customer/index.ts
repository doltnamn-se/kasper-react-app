import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createSupabaseAdmin, createAuthUser } from "./auth.ts";
import { CustomerData, updateProfile, updateCustomerSubscription } from "./customer.ts";
import { generateAndSendActivationEmail } from "./email.ts";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Loading create-customer function...");

serve(async (req: Request) => {
  console.log(`Received ${req.method} request to create-customer function`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log("Creating Supabase admin client");
    const supabaseAdmin = createSupabaseAdmin();
    
    console.log("Parsing request body");
    const { email, firstName, lastName, subscriptionPlan, createdBy } = await req.json();
    console.log("Request data:", { email, firstName, lastName, subscriptionPlan, createdBy });

    if (!email || !createdBy) {
      console.error("Missing required fields");
      throw new Error("Email and createdBy are required");
    }

    // Create auth user
    console.log("Creating auth user");
    const user = await createAuthUser(supabaseAdmin, email);
    console.log("Auth user created:", user.id);

    // Update profile and customer data
    console.log("Updating profile");
    await updateProfile(supabaseAdmin, user.id, firstName, lastName);
    
    console.log("Updating customer subscription");
    await updateCustomerSubscription(supabaseAdmin, user.id, subscriptionPlan, createdBy);

    // Generate and send activation email
    console.log("Generating and sending activation email");
    await generateAndSendActivationEmail(
      supabaseAdmin,
      email,
      firstName || "",
      req.headers.get("origin") || ""
    );

    console.log("Customer creation completed successfully");
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
  } catch (err: any) {
    console.error("Error in create-customer function:", err);
    return new Response(
      JSON.stringify({ 
        error: err.message || "An unexpected error occurred",
        details: err.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});