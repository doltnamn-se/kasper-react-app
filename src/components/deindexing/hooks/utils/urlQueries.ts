import { supabase } from "@/integrations/supabase/client";
import { URL } from "@/types/url-management";

export const fetchAdminUrls = async () => {
  console.log('urlQueries - Fetching URLs for admin view');
  const { data, error } = await supabase
    .from('removal_urls')
    .select(`
      id,
      url,
      status,
      created_at,
      customer:customers (
        id,
        profiles (
          email
        )
      ),
      status_history
    `)
    .order('created_at', { ascending: false })
    .order('id', { ascending: true }) // Secondary sort by ID for stability
    .limit(5000); // Increase limit to show all URLs (current total: ~1350)

  if (error) {
    console.error('urlQueries - Error fetching URLs:', error);
    throw error;
  }

  // Add detailed logging of the fetched URLs
  console.log('urlQueries - Raw response from Supabase:', data);
  
  // Log each URL separately for easier inspection
  data?.forEach(url => {
    console.log('urlQueries - URL entry:', {
      id: url.id,
      url: url.url,
      status: url.status,
      created_at: url.created_at,
      customer: url.customer
    });
  });

  return data as URL[];
};

export const updateUrlStatus = async (
  urlId: string, 
  newStatus: string, 
  customerId: string
) => {
  console.log('urlQueries - updateUrlStatus called with:', { 
    urlId, 
    newStatus,
    customerId 
  });
  
  // First, get the current status history
  const { data: currentUrl, error: fetchError } = await supabase
    .from('removal_urls')
    .select('status, status_history')
    .eq('id', urlId)
    .single();

  if (fetchError) {
    console.error('urlQueries - Error fetching current URL:', fetchError);
    throw fetchError;
  }

  // Don't update if status hasn't changed
  if (currentUrl.status === newStatus) {
    console.log('urlQueries - Status unchanged, skipping update');
    return null;
  }

  // Initialize history array if it doesn't exist
  const currentHistory = currentUrl.status_history || [];
  console.log('urlQueries - Current status history:', currentHistory);

  // Prepare the new status history entry
  const newHistoryEntry = {
    status: newStatus,
    timestamp: new Date().toISOString()
  };

  console.log('urlQueries - Adding new history entry:', newHistoryEntry);

  // Update the URL with new status and history
  const { error: updateError } = await supabase
    .from('removal_urls')
    .update({
      status: newStatus,
      status_history: [...currentHistory, newHistoryEntry],
    })
    .eq('id', urlId);

  if (updateError) {
    console.error('urlQueries - Error updating URL status:', updateError);
    throw updateError;
  }

  console.log('urlQueries - Successfully updated status history:', [...currentHistory, newHistoryEntry]);
  return { urlId, newStatus };
};

export const deleteUrl = async (urlId: string) => {
  console.log('urlQueries - Deleting URL:', urlId);
  
  const { error } = await supabase
    .from('removal_urls')
    .delete()
    .eq('id', urlId);

  if (error) {
    console.error('urlQueries - Error deleting URL:', error);
    throw error;
  }

  console.log('urlQueries - Successfully deleted URL');
  return { success: true };
};
