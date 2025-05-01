
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { syncAddressToProfile } from '@/utils/supabaseHelpers';
import { toast } from 'sonner';

export function useAddressSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncAddressForCustomer = async (customerId: string) => {
    if (!customerId) return false;
    
    try {
      setIsSyncing(true);
      const success = await syncAddressToProfile(supabase, customerId);
      
      if (success) {
        toast.success('Address synced successfully to profile');
      } else {
        toast.error('Could not sync address');
      }
      
      return success;
    } catch (error) {
      console.error('Error syncing address:', error);
      toast.error('Error syncing address');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };
  
  const syncAddressForAllCustomers = async () => {
    try {
      setIsSyncing(true);
      
      // Get all customers
      const { data: customers, error } = await supabase
        .from('customers')
        .select('id');
        
      if (error) {
        throw error;
      }
      
      if (!customers || customers.length === 0) {
        toast.info('No customers found to sync');
        return;
      }
      
      toast.info(`Starting address sync for ${customers.length} customers...`);
      
      let successCount = 0;
      
      // Sync address for each customer
      for (const customer of customers) {
        const success = await syncAddressToProfile(supabase, customer.id);
        if (success) successCount++;
      }
      
      toast.success(`Address sync completed. Updated ${successCount}/${customers.length} profiles.`);
    } catch (error) {
      console.error('Error syncing addresses:', error);
      toast.error('Error syncing addresses for all customers');
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    syncAddressForCustomer,
    syncAddressForAllCustomers
  };
}
