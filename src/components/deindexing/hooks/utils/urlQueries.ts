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
      )
    `)
    .order('created_at', { ascending: false })
    .order('id', { ascending: true }); // Secondary sort by ID for stability

  if (error) {
    console.error('Error fetching URLs:', error);
    throw error;
  }

  console.log('Fetched URLs:', data);
  return data as URL[];
};

export const updateUrlStatus = async (
  urlId: string, 
  newStatus: string, 
  customerId: string
) => {
  console.log('Updating URL status:', { urlId, newStatus });
  
  const { error: updateError } = await supabase
    .from('removal_urls')
    .update({
      status: newStatus,
    })
    .eq('id', urlId);

  if (updateError) {
    console.error('Error updating URL status:', updateError);
    throw updateError;
  }

  return { urlId, newStatus };
};