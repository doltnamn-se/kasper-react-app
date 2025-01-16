import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Stripe from 'https://esm.sh/stripe@14.12.0';

console.log("Stripe webhook function starting...");

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(
  supabaseUrl || '',
  supabaseServiceRoleKey || '',
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Received webhook request");

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the stripe signature from the headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error("No stripe signature found in request");
      return new Response(
        JSON.stringify({ error: 'No stripe signature found in request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the raw body
    const body = await req.text();
    console.log("Received webhook body");

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') || ''
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing event type: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log(`Processing subscription event for subscription ${subscription.id}`);

        // Get the customer from our database
        const { data: customers, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (customerError || !customers) {
          console.error(`Customer not found for stripe_customer_id: ${subscription.customer}`);
          return new Response(
            JSON.stringify({ error: 'Customer not found' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update or insert the subscription in our database
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert({
            customer_id: customers.id,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'stripe_subscription_id'
          });

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
          return new Response(
            JSON.stringify({ error: 'Error updating subscription' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        break;
      }

      case 'customer.created': {
        const customer = event.data.object;
        console.log(`Processing customer created event for customer ${customer.id}`);

        // If the customer has a metadata field with the user_id, create a record in our customers table
        if (customer.metadata?.user_id) {
          const { error: customerError } = await supabase
            .from('customers')
            .upsert({
              id: customer.metadata.user_id,
              stripe_customer_id: customer.id,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id'
            });

          if (customerError) {
            console.error('Error creating customer:', customerError);
            return new Response(
              JSON.stringify({ error: 'Error creating customer' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    return new Response(
      JSON.stringify({ error: 'Error processing webhook' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});