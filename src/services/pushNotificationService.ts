
import { PushNotifications } from '@capacitor/push-notifications';
import { isNativePlatform } from '@/capacitor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DeviceToken } from '@/types/device-token';

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

      // Register with FCM (Firebase Cloud Messaging) or APNs
      console.log('Registering push notifications');
      
      try {
        await PushNotifications.register();
        this.initialized = true;
        console.log('Push notification registration successful');
        
        // Setup listeners for push notification events
        console.log('Setting up push notification listeners');
        this.setupListeners();
      } catch (firebaseError) {
        console.error('Firebase initialization error:', firebaseError);
        toast.error('Push notification service unavailable');
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }

  // Set up listeners for push notification events
  private setupListeners() {
    try {
      // On registration success, save the token to the database
      PushNotifications.addListener('registration', async (token) => {
        console.log('🔔 Push registration success! Token:', token.value);
        
        try {
          // Get current user
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            console.log('No active session, cannot save push token');
            return;
          }

          console.log('Saving push token to database for user:', session.user.id);
          
          // Save token to database
          const deviceToken: DeviceToken = {
            user_id: session.user.id,
            token: token.value,
            device_type: isNativePlatform() ? (navigator.userAgent.includes('Android') ? 'android' : 'ios') : 'web',
            last_updated: new Date().toISOString()
          };

          // Try to delete any existing tokens with this value first
          const { error: deleteError } = await supabase
            .from('device_tokens')
            .delete()
            .eq('token', token.value);
            
          if (deleteError) {
            console.log('Error deleting existing token (may not exist):', deleteError);
          } else {
            console.log('Deleted any existing token with same value');
          }

          // Insert the new token
          const { data, error } = await supabase
            .from('device_tokens')
            .insert(deviceToken);

          if (error) {
            console.error('Error saving push token:', error);
            // Try upsert as a fallback
            const { error: upsertError } = await supabase
              .from('device_tokens')
              .upsert(deviceToken, { onConflict: 'user_id,token' });
              
            if (upsertError) {
              console.error('Error upserting token:', upsertError);
            } else {
              console.log('Push token upserted successfully');
            }
          } else {
            console.log('Push token saved successfully:', data);
            
            // Verify token was saved
            const { data: savedTokens } = await supabase
              .from('device_tokens')
              .select('*')
              .eq('user_id', session.user.id);
            
            console.log('Token verification result:', savedTokens);
          }
          
          // Log the token for debugging
          toast.success('Push notifications enabled');
        } catch (err) {
          console.error('Error saving push token to database:', err);
        }
      });

      // Handle push notification received when app is in foreground
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
        
        // Show in-app toast for foreground notifications
        if (notification.title && notification.body) {
          toast(notification.title, {
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
        toast.error('Push notification registration failed');
      });
    } catch (error) {
      console.error('Error setting up notification listeners:', error);
    }
  }

  // Testing: Manually fetch and display tokens
  async debugTokens() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('No active session');
        return null;
      }
      
      const { data, error } = await supabase
        .from('device_tokens')
        .select('*')
        .eq('user_id', session.user.id);
        
      console.log('Debug - Device tokens:', data);
      console.log('Debug - Token error:', error);
      
      return data;
    } catch (error) {
      console.error('Error debugging tokens:', error);
      return null;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
