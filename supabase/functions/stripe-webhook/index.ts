import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const STRIPE_WEBHOOK_SIGNING_SECRET = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');

serve(async (req) => {
  try {
    if (req.method === 'POST') {
      const signature = req.headers.get('stripe-signature');
      if (!signature || !STRIPE_WEBHOOK_SIGNING_SECRET) {
        return new Response('Webhook signature missing or secret not configured', { status: 400 });
      }

      const body = await req.text();
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          STRIPE_WEBHOOK_SIGNING_SECRET
        );
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
      }

      console.log(`Event received: ${event.type}`);

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          console.log('Checkout session completed:', session);
          
          // Create user in Supabase
          const { customer_email, metadata } = session;
          if (customer_email && metadata?.productId) {
            try {
              const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: customer_email,
                email_confirm: true,
                password: crypto.randomUUID(), // Generate a random password
                user_metadata: {
                  productId: metadata.productId,
                  stripeCustomerId: session.customer
                }
              });

              if (authError) {
                throw authError;
              }

              console.log('User created successfully:', authData);
            } catch (error) {
              console.error('Error creating user:', error);
              // Don't return an error response as the payment was successful
              // Just log the error and return success
            }
          }
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
});