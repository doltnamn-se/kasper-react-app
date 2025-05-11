
import { supabase } from "@/integrations/supabase/client";
import { MonitoringUrl, MonitoringUrlStatus } from "@/types/monitoring-urls";
import { getQueryClient } from "../monitoringUrlQueries";

/**
 * Update monitoring URL status
 */
export async function updateUrlStatus(
  urlId: string, 
  status: MonitoringUrlStatus, 
  reason?: string
): Promise<MonitoringUrl> {
  console.log(`Updating monitoring URL status: ${urlId} to ${status}`);
  
  try {
    // First, get the current monitoring URL data to pass to the edge function
    const { data: urlData, error: fetchError } = await supabase
      .from('monitoring_urls')
      .select('*')
      .eq('id', urlId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching monitoring URL details:', fetchError);
      throw new Error(`Error fetching monitoring URL details: ${fetchError.message}`);
    }

    console.log('Found monitoring URL data:', urlData);
    
    // Call the edge function directly to handle all the update operations 
    // with service role privileges
    console.log('Calling edge function to update monitoring URL status');
    const { data: functionResult, error: functionError } = await supabase.functions.invoke('monitoring-url-status', {
      body: {
        monitoringUrlId: urlId,
        siteName: urlData.url,
        newStatus: status,
        reason: reason || null,
        customerId: urlData.customer_id,
        language: document.documentElement.lang || 'en',
        forceEmail: true,  // Keep this flag to force email sending for debugging
        skipUserEmail: false // Changed from true to false to allow email notifications
      }
    });
    
    if (functionError) {
      console.error('Error from edge function:', functionError);
      throw new Error(`Error from edge function: ${functionError.message}`);
    }
    
    console.log('Edge function response:', functionResult);
    
    // Check if the function reports success
    if (!functionResult.success) {
      throw new Error(functionResult.error || 'Unknown error from edge function');
    }
    
    // For approved URLs, invalidate queries related to incoming URLs to refresh the UI
    const queryClient = getQueryClient();
    if (status === 'approved' && queryClient) {
      await queryClient.invalidateQueries({ queryKey: ['incoming-urls'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-urls'] });
    }
    
    return functionResult.updatedUrl;
  } catch (error: any) {
    console.error('Error in updateMonitoringUrlStatus:', error);
    throw error; // Re-throw for the caller to handle
  }
}
