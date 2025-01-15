import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("Stripe webhook function ready");

serve(async (req) => {
  console.log("Received webhook request");
  
  return new Response(
    JSON.stringify({ message: "Webhook endpoint temporarily disabled" }),
    { status: 200 }
  );
});