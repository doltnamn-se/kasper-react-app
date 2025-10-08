import { useState, useCallback } from 'react';
import { isAndroid } from '@/capacitor';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for Android-specific refresh functionality
 */
export const useAndroidRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRefresh = useCallback(async () => {
    if (!isAndroid()) return;

    console.log('[Android] Starting refresh...');
    setIsRefreshing(true);

    try {
      // 1. Check auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[Android] Session check failed:', sessionError);
        // Try to refresh the session
        await supabase.auth.refreshSession();
      }

      // 2. Invalidate all queries to force refetch
      await queryClient.invalidateQueries();

      // 3. Refetch active queries
      await queryClient.refetchQueries({ type: 'active' });

      console.log('[Android] Refresh completed successfully');
      
      toast({
        title: 'Uppdaterad',
        description: 'Data har uppdaterats',
      });
    } catch (error) {
      console.error('[Android] Refresh failed:', error);
      
      toast({
        title: 'Kunde inte uppdatera',
        description: 'Försök igen om en stund',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, toast]);

  return {
    isRefreshing,
    handleRefresh,
  };
};
