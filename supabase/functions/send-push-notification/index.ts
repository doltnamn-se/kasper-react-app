
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
  console.log("Initializing Firebase...");
  // Retrieve Firebase service account from Supabase secret
  const firebaseServiceAccount = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
  
  if (!firebaseServiceAccount) {
    console.error("Firebase service account not configured in environment variables");
    throw new Error("Firebase service account not configured");
  }

  try {
    const credentials = JSON.parse(firebaseServiceAccount);
    console.log("Firebase credentials parsed successfully, project_id:", credentials.project_id);
    
    const firebaseConfig = {
      credential: {
        projectId: credentials.project_id,
        clientEmail: credentials.client_email,
        privateKey: credentials.private_key,
      }
    };

    return { firebaseConfig, projectId: credentials.project_id };
  } catch (error) {
    console.error("Error parsing Firebase credentials:", error);
    throw new Error("Invalid Firebase credentials format");
  }
}

// Send push notification via Firebase Cloud Messaging
async function sendPushNotification(payload: PushNotificationPayload) {
  try {
    console.log("Sending push notification with payload:", {
      title: payload.title,
      body: payload.body,
      tokenCount: payload.tokens.length,
      tokens: payload.tokens.map(t => t.substring(0, 10) + "..."), // Log first 10 chars of token for privacy
      data: payload.data
    });
    
    const { firebaseConfig, projectId } = await initializeFirebase();
    
    // URL to the FCM API
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    console.log("FCM API URL:", url);
    
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
            channelId: "default-channel",
          }
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
              content_available: true,
            }
          }
        }
      }
    }));

    console.log("Attempting to get FCM access token...");
    const accessToken = await getAccessToken(firebaseConfig);
    console.log("Successfully obtained FCM access token");

    // Make authenticated request to FCM
    console.log(`Sending ${messages.length} messages to FCM...`);
    const responses = await Promise.all(
      messages.map(async (msg, index) => { 
        console.log(`Sending message to token: ${payload.tokens[index].substring(0, 10)}...`);
        
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(msg),
          });
          
          const responseText = await response.text();
          console.log(`FCM response for token ${index}: [${response.status}] ${responseText}`);
          
          if (!response.ok) {
            console.error(`Error sending to token ${payload.tokens[index]}: ${responseText}`);
            return { success: false, token: payload.tokens[index], error: responseText };
          }
          
          return { success: true, token: payload.tokens[index] };
        } catch (fetchError) {
          console.error(`Fetch error for token ${payload.tokens[index]}:`, fetchError);
          return { success: false, token: payload.tokens[index], error: fetchError.message };
        }
      })
    );

    console.log("Push notification sending complete");
    return responses;
  } catch (error) {
    console.error("Error in sendPushNotification function:", error);
    throw error;
  }
}

// Get Firebase access token
async function getAccessToken(config: any) {
  try {
    console.log("Generating JWT for Firebase authentication...");
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
    try {
      console.log("Importing private key...");
      const key = await crypto.subtle.importKey(
        "pkcs8",
        new TextEncoder().encode(privateKey),
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
      );
      console.log("Private key imported successfully");
      
      // Sign the JWT
      console.log("Signing JWT...");
      const signature = await crypto.subtle.sign(
        { name: "RSASSA-PKCS1-v1_5" },
        key,
        toSign
      );
      console.log("JWT signed successfully");
      
      // Convert signature to base64url
      const signatureEncoded = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=+$/, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
      
      // Combine to form JWT
      const jwt = `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`;
      
      // Exchange JWT for access token
      console.log("Exchanging JWT for access token...");
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: jwt,
        }),
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Error response from token endpoint:", errorText);
        throw new Error(`Failed to get access token: ${errorText}`);
      }
      
      const tokenData = await tokenResponse.json();
      console.log("Successfully obtained access token");
      
      return tokenData.access_token;
    } catch (cryptoError) {
      console.error("Error during crypto operations:", cryptoError);
      throw cryptoError;
    }
  } catch (error) {
    console.error("Error generating access token:", error);
    throw error;
  }
}

// Handle HTTP requests
const handler = async (req: Request) => {
  console.log("Received request to send-push-notification function");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const payload: PushNotificationPayload = await req.json();
    console.log("Received push notification request:", {
      title: payload.title,
      body: payload.body,
      tokenCount: payload.tokens?.length || 0,
      hasData: !!payload.data
    });
    
    // Validate payload
    if (!payload.tokens || !payload.tokens.length) {
      console.error("No tokens provided in request payload");
      throw new Error("No tokens provided");
    }
    
    if (!payload.title || !payload.body) {
      console.error("Title and body are missing in request payload");
      throw new Error("Title and body are required");
    }

    // Send push notification
    const results = await sendPushNotification(payload);
    
    // Return response
    console.log("Sending successful response with results");
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
