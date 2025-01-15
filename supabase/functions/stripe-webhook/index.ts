import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const STRIPE_WEBHOOK_SIGNING_SECRET = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
const STRIPE_TEST_WEBHOOK_SIGNING_SECRET = Deno.env.get('STRIPE_TEST_WEBHOOK_SIGNING_SECRET');

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
        // Determine if this is a test event
        const stripeEvent = JSON.parse(body);
        const isTestMode = stripeEvent.livemode === false;
        console.log(`Processing ${isTestMode ? 'test' : 'live'} mode event`);

        const signingSecret = isTestMode 
          ? STRIPE_TEST_WEBHOOK_SIGNING_SECRET 
          : STRIPE_WEBHOOK_SIGNING_SECRET;

        if (!signingSecret) {
          console.error(`${isTestMode ? 'Test' : 'Live'} webhook signing secret not configured`);
          return new Response('Webhook signing secret not configured', { status: 400 });
        }

        event = stripe.webhooks.constructEvent(
          body,
          signature,
          signingSecret
        );
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
      }

      console.log(`Event received: ${event.type}`);

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          console.log('Checkout session completed:', session);
          
          // Create user in Supabase
          const { customer_email } = session;
          if (customer_email) {
            try {
              const supabaseAdmin = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
                {
                  auth: {
                    autoRefreshToken: false,
                    persistSession: false
                  }
                }
              );

              // Generate a secure random password
              const tempPassword = crypto.randomUUID();

              console.log('Creating user in Supabase:', customer_email);
              const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: customer_email,
                email_confirm: true,
                password: tempPassword,
                user_metadata: {
                  stripe_customer_id: session.customer,
                  payment_status: 'completed',
                  is_test_user: event.livemode === false
                }
              });

              if (authError) {
                console.error('Error creating user:', authError);
                throw authError;
              }

              console.log('User created successfully:', authData.user.id);

              // Send password reset email to allow user to set their password
              const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: customer_email,
              });

              if (resetError) {
                console.error('Error generating password reset link:', resetError);
                throw resetError;
              }

              console.log('Password reset email sent to:', customer_email);
            } catch (error) {
              console.error('Error in user creation process:', error);
              // Don't return an error response as the payment was successful
              // Just log the error and return success
            }
          }
          break;
        }
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
});