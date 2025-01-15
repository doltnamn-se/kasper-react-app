import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle POST request for creating checkout session
    if (req.method === 'POST') {
      const { test } = await req.json();
      
      if (test) {
        console.log('Creating test checkout session...');
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
          apiVersion: '2023-10-16',
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Test Product',
                },
                unit_amount: 500, // $5.00
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${req.headers.get('origin')}/auth`,
          cancel_url: `${req.headers.get('origin')}/auth`,
        });

        console.log('Test checkout session created:', session.id);
        return new Response(
          JSON.stringify({ url: session.url }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      // Verify webhook signature
      const signature = req.headers.get('stripe-signature');
      if (!signature) {
        console.error('Webhook signature missing');
        return new Response('Webhook signature missing', { status: 400 });
      }

      const body = await req.text();
      let event;

      try {
        const stripeEvent = JSON.parse(body);
        const isTestMode = stripeEvent.livemode === false;
        console.log(`Processing ${isTestMode ? 'test' : 'live'} mode event:`, stripeEvent.type);

        const signingSecret = isTestMode 
          ? Deno.env.get('STRIPE_TEST_WEBHOOK_SIGNING_SECRET')
          : Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');

        if (!signingSecret) {
          console.error(`${isTestMode ? 'Test' : 'Live'} webhook signing secret not configured`);
          return new Response('Webhook signing secret not configured', { status: 400 });
        }

        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
          apiVersion: '2023-10-16',
        });

        event = stripe.webhooks.constructEvent(
          body,
          signature,
          signingSecret
        );
      } catch (err) {
        console.error(`Webhook signature verification failed:`, err);
        return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
      }

      console.log(`Event type: ${event.type}`);

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          console.log('Processing completed checkout session:', session);
          break;
        }
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return new Response(
        JSON.stringify({ received: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});