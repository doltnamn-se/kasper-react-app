
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

// Get environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create a Supabase client with admin privileges
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Update monitoring URL status
 */
export async function updateMonitoringUrl(monitoringUrlId: string, newStatus: string, reason?: string) {
  console.log(`Updating monitoring URL: ${monitoringUrlId} to ${newStatus}`);
  
  const { data: updatedUrl, error: updateError } = await supabaseAdmin
    .from('monitoring_urls')
    .update({
      status: newStatus,
      ...(reason ? { reason } : {}),
      updated_at: new Date().toISOString()
    })
    .eq('id', monitoringUrlId)
    .select('*')
    .single();

  if (updateError) {
    console.error("Error updating monitoring URL:", updateError);
    throw new Error(`Error updating monitoring URL: ${updateError.message}`);
  }
  
  console.log("Successfully updated monitoring URL status:", updatedUrl);
  return updatedUrl;
}
