
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

// Get environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create a Supabase client with admin privileges
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Create a removal URL entry if it doesn't already exist
 */
export async function createRemovalUrl(customerId: string, siteName: string) {
  console.log(`Checking for existing removal URL: ${siteName} for customer ${customerId}`);
  
  try {
    // Check if a removal URL already exists for this URL and customer
    const { data: existingUrl, error: checkError } = await supabaseAdmin
      .from('removal_urls')
      .select('id')
      .eq('customer_id', customerId)
      .eq('url', siteName)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking for existing removal URL:", checkError);
      throw checkError;
    }

    // Only create a new removal URL if one doesn't exist
    if (!existingUrl) {
      console.log("No existing removal URL found, creating new one");
      
      const { data: newRemovalUrl, error: removalError } = await supabaseAdmin
        .from('removal_urls')
        .insert({
          customer_id: customerId,
          url: siteName,
          status: 'received',
          current_status: 'received',
          display_in_incoming: true
        })
        .select()
        .single();

      if (removalError) {
        console.error("Error creating removal URL:", removalError);
        throw removalError;
      }
      
      console.log("Successfully created removal URL:", newRemovalUrl);
      return newRemovalUrl;
    } else {
      console.log("Removal URL already exists for this URL, skipping creation");
      return existingUrl;
    }
  } catch (error) {
    console.error("Error in createRemovalUrl:", error);
    throw error;
  }
}
