
import { PushNotifications } from '@capacitor/push-notifications';
import { isNativePlatform } from '@/capacitor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DeviceToken } from '@/utils/supabaseHelpers';

// Service for handling push notifications
class PushNotificationService {
  private initialized = false;

  // Register device for push notifications and handle events
  async register() {
    if (!isNativePlatform()) {
      console.log('Push notifications are only available on native platforms');
      return;
    }

    if (this.initialized) {
      console.log('Push notifications already initialized');
      return;
    }

    try {
      console.log('Initializing push notifications...');
      
      // Request permission to use push notifications
      console.log('Requesting push notification permissions');
      const permission = await PushNotifications.requestPermissions();
      console.log('Push notification permission status:', permission);

      if (permission.receive !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      // Register with FCM (Firebase Cloud Messaging)
      console.log('Registering with Firebase Cloud Messaging');
      await PushNotifications.register();
      this.initialized = true;

      // Setup listeners for push notification events
      console.log('Setting up push notification listeners');
      this.setupListeners();

      console.log('Push notification registration successful');
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }

  // Set up listeners for push notification events
  private setupListeners() {
    // On registration success, save the token to the database
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token:', token.value);
      
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.log('No active session, cannot save push token');
          return;
        }

        console.log('Saving token to database for user:', session.user.id);
        
        // Save token to database using custom type assertion
        const { error } = await supabase
          .from('device_tokens' as any)
          .upsert({
            user_id: session.user.id,
            token: token.value,
            device_type: navigator.userAgent.includes('Android') ? 'android' : 'ios',
            last_updated: new Date().toISOString()
          }, {
            onConflict: 'user_id, token'
          });

        if (error) {
          console.error('Error saving push token:', error);
        } else {
          console.log('Push token saved successfully');
          
          // Verify token was saved correctly
          const { data: savedTokens, error: verifyError } = await supabase
            .from('device_tokens')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('token', token.value);
          
          if (verifyError) {
            console.error('Error verifying saved token:', verifyError);
          } else {
            console.log('Token verification result:', savedTokens);
          }
        }
      } catch (err) {
        console.error('Error saving push token to database:', err);
      }
    });

    // Handle push notification received when app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      
      // Show in-app toast for foreground notifications
      if (notification.title && notification.body) {
        toast({
          title: notification.title,
          description: notification.body,
        });
      }
    });

    // Handle when a notification is tapped
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
      // Handle navigation or other actions based on the notification
    });

    // Error handling
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on push notification registration:', error);
    });
  }

  // Get the device token
  async getDeviceToken() {
    if (!isNativePlatform() || !this.initialized) {
      return null;
    }

    try {
      const result = await PushNotifications.getDeliveredNotifications();
      return result;
    } catch (error) {
      console.error('Error getting device token:', error);
      return null;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
