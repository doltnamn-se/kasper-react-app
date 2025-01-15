import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

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
        // Determine if this is a test event
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
          
          // Create user in Supabase
          const { customer_email } = session;
          if (customer_email) {
            try {
              console.log('Initializing Supabase client...');
              const supabaseUrl = Deno.env.get('SUPABASE_URL');
              const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
              
              if (!supabaseUrl || !supabaseServiceKey) {
                throw new Error('Missing Supabase configuration');
              }

              console.log('Creating Supabase admin client...');
              const supabaseAdmin = createClient(
                supabaseUrl,
                supabaseServiceKey
              );

              // First, check if the user already exists
              console.log('Checking if user exists:', customer_email);
              const { data: existingUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(customer_email);

              if (getUserError) {
                console.error('Error checking existing user:', getUserError);
                // Continue with user creation if we can't verify existence
              }

              if (existingUser) {
                console.log('User already exists:', existingUser.id);
                // User exists, no need to create a new one
                return new Response(
                  JSON.stringify({ received: true }),
                  { 
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                  }
                );
              }

              // Generate a secure random password only if we need to create a new user
              const tempPassword = crypto.randomUUID();

              console.log('Attempting to create new user:', customer_email);
              const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: customer_email,
                password: tempPassword,
                email_confirm: true
              });

              if (authError) {
                console.error('Error creating user:', authError);
                console.error('Full auth error:', JSON.stringify(authError, null, 2));
                // Don't throw the error, just log it and continue
                return new Response(
                  JSON.stringify({ received: true, warning: 'User creation failed but payment processed' }),
                  { 
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                  }
                );
              }

              console.log('User created successfully:', authData.user.id);

              // Send password reset email
              console.log('Generating password reset link...');
              const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: customer_email,
              });

              if (resetError) {
                console.error('Error generating password reset link:', resetError);
                console.error('Full reset error:', JSON.stringify(resetError, null, 2));
                // Don't throw the error, just log it
              } else {
                console.log('Password reset email sent successfully');
              }
            } catch (error) {
              console.error('Error in user creation process:', error);
              console.error('Full error:', JSON.stringify(error, null, 2));
              // Don't throw the error, continue with success response
            }
          } else {
            console.error('No customer email in session:', session);
          }
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