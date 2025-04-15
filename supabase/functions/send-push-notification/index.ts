
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationPayload {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}

// Firebase Admin SDK initialization
async function initializeFirebase() {
  // Retrieve Firebase service account from Supabase secret
  const firebaseServiceAccount = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
  
  if (!firebaseServiceAccount) {
    throw new Error("Firebase service account not configured");
  }

  const credentials = JSON.parse(firebaseServiceAccount);
  
  const firebaseConfig = {
    credential: {
      projectId: credentials.project_id,
      clientEmail: credentials.client_email,
      privateKey: credentials.private_key,
    }
  };

  return { firebaseConfig, projectId: credentials.project_id };
}

// Send push notification via Firebase Cloud Messaging
async function sendPushNotification(payload: PushNotificationPayload) {
  try {
    const { firebaseConfig, projectId } = await initializeFirebase();
    
    // URL to the FCM API
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    
    // Create the message payload for FCM
    const messages = payload.tokens.map(token => ({
      message: {
        token: token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          notification: {
            sound: "default",
            priority: "high",
          }
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            }
          }
        }
      }
    }));

    // Make authenticated request to FCM
    const responses = await Promise.all(
      messages.map(msg => 
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getAccessToken(firebaseConfig)}`,
          },
          body: JSON.stringify(msg),
        })
      )
    );

    return responses.map(async (response, index) => {
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error sending to token ${payload.tokens[index]}: ${errorText}`);
        return { success: false, token: payload.tokens[index], error: errorText };
      }
      return { success: true, token: payload.tokens[index] };
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
    throw error;
  }
}

// Get Firebase access token
async function getAccessToken(config: any) {
  try {
    const jwtClaims = {
      iss: config.credential.clientEmail,
      sub: config.credential.clientEmail,
      aud: "https://oauth2.googleapis.com/token",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
    };

    // Generate JWT
    const encoder = new TextEncoder();
    const header = { alg: "RS256", typ: "JWT" };
    const headerStr = JSON.stringify(header);
    const payloadStr = JSON.stringify(jwtClaims);
    const headerEncoded = btoa(headerStr).replace(/=+$/, "");
    const payloadEncoded = btoa(payloadStr).replace(/=+$/, "");
    const toSign = encoder.encode(`${headerEncoded}.${payloadEncoded}`);
    
    // Convert private key to proper format
    const privateKey = config.credential.privateKey.replace(/\\n/g, "\n");
    
    // Create crypto key from private key
    const key = await crypto.subtle.importKey(
      "pkcs8",
      new TextEncoder().encode(privateKey),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    // Sign the JWT
    const signature = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      key,
      toSign
    );
    
    // Convert signature to base64url
    const signatureEncoded = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=+$/, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    
    // Combine to form JWT
    const jwt = `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`;
    
    // Exchange JWT for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error("Error getting access token:", tokenData);
      throw new Error(`Failed to get access token: ${tokenData.error}`);
    }
    
    return tokenData.access_token;
  } catch (error) {
    console.error("Error generating access token:", error);
    throw error;
  }
}

// Handle HTTP requests
const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const payload: PushNotificationPayload = await req.json();
    console.log("Received push notification request:", payload);
    
    // Validate payload
    if (!payload.tokens || !payload.tokens.length) {
      throw new Error("No tokens provided");
    }
    
    if (!payload.title || !payload.body) {
      throw new Error("Title and body are required");
    }

    // Send push notification
    const results = await sendPushNotification(payload);
    
    // Return response
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-push-notification function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
