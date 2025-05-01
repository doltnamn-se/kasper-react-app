
import { PostgrestError } from '@supabase/supabase-js';

export function isError<T>(
  result: T | PostgrestError
): result is PostgrestError {
  return (result as PostgrestError).code !== undefined;
}

export function handleQueryResult<T>(
  data: T | null,
  error: PostgrestError | null
): T | null {
  if (error) {
    console.error('Database query error:', error);
    return null;
  }
  return data;
}

export function ensureResult<T>(
  result: T | null,
  errorMessage: string = 'Failed to fetch data'
): T {
  if (!result) {
    throw new Error(errorMessage);
  }
  return result;
}

// Add this type to define the device token structure
export type DeviceToken = {
  id: string;
  user_id: string;
  token: string;
  device_type: string;
  created_at: string;
  last_updated: string;
};

// Add this function to copy address data from checklist to profile
export async function syncAddressToProfile(supabase: any, customerId: string) {
  try {
    console.log('Syncing address for customer ID:', customerId);
    
    // Get address from checklist_progress
    const { data: checklistData, error: checklistError } = await supabase
      .from('customer_checklist_progress')
      .select('address')
      .eq('customer_id', customerId)
      .maybeSingle();
      
    if (checklistError) {
      console.error('Error fetching checklist data:', checklistError);
      return false;
    }
    
    if (!checklistData || !checklistData.address) {
      console.log('No address found in checklist data for customer:', customerId);
      return false;
    }
    
    console.log('Found address in checklist:', checklistData.address);
    
    // Update the profile with the address
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ address: checklistData.address })
      .eq('id', customerId);
      
    if (updateError) {
      console.error('Error updating profile with address:', updateError);
      return false;
    }
    
    console.log('Successfully synced address to profile for customer:', customerId);
    return true;
  } catch (err) {
    console.error('Unexpected error in syncAddressToProfile:', err);
    return false;
  }
}
