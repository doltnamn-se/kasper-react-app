import { supabase } from "@/integrations/supabase/client";
import { URL } from "@/types/url-management";

export const fetchAdminUrls = async () => {
  console.log('Fetching URLs for admin view');
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
    .order('id', { ascending: true }); // Secondary sort by ID for stability

  if (error) {
    console.error('Error fetching URLs:', error);
    throw error;
  }

  console.log('Fetched URLs with status history:', data?.map(url => ({
    id: url.id,
    status: url.status,
    statusHistory: url.status_history
  })));
  
  return data as URL[];
};

export const updateUrlStatus = async (
  urlId: string, 
  newStatus: string, 
  customerId: string
) => {
  console.log('Updating URL status:', { urlId, newStatus });
  
  // First, get the current status history
  const { data: currentUrl, error: fetchError } = await supabase
    .from('removal_urls')
    .select('status_history')
    .eq('id', urlId)
    .single();

  if (fetchError) {
    console.error('Error fetching current URL:', fetchError);
    throw fetchError;
  }

  // Prepare the new status history entry
  const newHistoryEntry = {
    status: newStatus,
    timestamp: new Date().toISOString()
  };

  console.log('Current status history:', currentUrl.status_history);
  console.log('Adding new history entry:', newHistoryEntry);

  // Combine existing history with new entry
  const updatedHistory = [
    ...(currentUrl.status_history || []),
    newHistoryEntry
  ];

  // Update the URL with new status and history
  const { error: updateError } = await supabase
    .from('removal_urls')
    .update({
      status: newStatus,
      status_history: updatedHistory,
    })
    .eq('id', urlId);

  if (updateError) {
    console.error('Error updating URL status:', updateError);
    throw updateError;
  }

  console.log('Successfully updated status history:', updatedHistory);
  return { urlId, newStatus };
};