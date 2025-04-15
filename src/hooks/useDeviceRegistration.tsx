
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isNativePlatform } from '@/capacitor';
import { pushNotificationService } from '@/services/pushNotificationService';
import { useToast } from '@/hooks/use-toast';

export const useDeviceRegistration = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isNativePlatform()) {
      setIsRegistered(false);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const checkRegistration = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.log('No active session, cannot check device registration');
          if (isMounted) {
            setIsRegistered(false);
            setIsLoading(false);
          }
          return;
        }

        // Check if device token is registered in database
        const { data, error } = await supabase
          .from('device_tokens')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Error checking device registration:', error);
          if (isMounted) {
            setIsRegistered(false);
            setIsLoading(false);
          }
          return;
        }

        const hasToken = data && data.length > 0;
        console.log('Device registration status:', hasToken ? 'Registered' : 'Not registered');
        
        if (isMounted) {
          setIsRegistered(hasToken);
          setIsLoading(false);
        }
        
        // If not registered, attempt to register
        if (!hasToken) {
          await pushNotificationService.register();
        }
      } catch (err) {
        console.error('Error in checkRegistration:', err);
        if (isMounted) {
          setIsRegistered(false);
          setIsLoading(false);
        }
      }
    };

    checkRegistration();

    // Set up listener for device token changes
    const channel = supabase.channel('device-token-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'device_tokens'
        },
        () => {
          console.log('Device token table changed, rechecking registration');
          checkRegistration();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const registerDevice = async () => {
    if (!isNativePlatform()) {
      return false;
    }

    try {
      await pushNotificationService.register();
      
      // Verify registration
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return false;
      }

      const { data } = await supabase
        .from('device_tokens')
        .select('*')
        .eq('user_id', session.user.id);

      const isSuccess = data && data.length > 0;
      setIsRegistered(isSuccess);
      
      return isSuccess;
    } catch (err) {
      console.error('Error registering device:', err);
      toast({
        title: 'Registration Error',
        description: 'Failed to register device for notifications',
      });
      return false;
    }
  };

  return {
    isRegistered,
    isLoading,
    registerDevice
  };
};
