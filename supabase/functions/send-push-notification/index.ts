
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Get Firebase service account credentials from environment variable
const firebaseServiceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT") || "{}");

interface PushNotificationPayload {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: PushNotificationPayload = await req.json();
    console.log("Received push notification request:", JSON.stringify(payload));

    if (!payload.tokens || payload.tokens.length === 0) {
      throw new Error("No device tokens provided");
    }

    if (!payload.title || !payload.body) {
      throw new Error("Missing notification title or body");
    }

    console.log(`Sending push notification to ${payload.tokens.length} device(s)`);

    // Create the message
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      tokens: payload.tokens,
    };

    // Call Firebase Cloud Messaging API
    const response = await fetch("https://fcm.googleapis.com/v1/projects/" + 
      firebaseServiceAccount.project_id + "/messages:send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + await getAccessToken(),
      },
      body: JSON.stringify({
        message: {
          ...message.notification,
          token: payload.tokens[0], // For simplicity, send to first token
          android: {
            notification: {
              sound: "default",
            },
          },
          apns: {
            payload: {
              aps: {
                sound: "default",
              },
            },
          },
        }
      }),
    });

    const result = await response.json();
    console.log("Push notification sent result:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: response.ok ? 200 : 400,
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

// Helper function to get a Firebase access token
async function getAccessToken() {
  try {
    if (!firebaseServiceAccount.private_key) {
      throw new Error("Firebase service account not configured");
    }

    // Create JWT
    const now = Math.floor(Date.now() / 1000);
    const jwt = {
      iss: firebaseServiceAccount.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    // Encode JWT header
    const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    
    // Encode JWT payload
    const payload = btoa(JSON.stringify(jwt));
    
    // Sign the JWT
    const textEncoder = new TextEncoder();
    const privateKey = firebaseServiceAccount.private_key.replace(/\\n/g, "\n");
    
    const keyData = textEncoder.encode(privateKey);
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      keyData,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      cryptoKey,
      textEncoder.encode(`${header}.${payload}`)
    );
    
    // Create signed JWT
    const signedJwt = `${header}.${payload}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;
    
    // Exchange JWT for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: signedJwt,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error("Failed to obtain access token: " + JSON.stringify(tokenData));
    }
    
    return tokenData.access_token;
  } catch (error) {
    console.error("Error getting Firebase access token:", error);
    throw error;
  }
}

serve(handler);
