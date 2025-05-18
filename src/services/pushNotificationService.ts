
import { PushNotifications } from '@capacitor/push-notifications';
import { isNativePlatform } from '@/capacitor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DeviceToken } from '@/types/device-token';

// Service for handling push notifications
class PushNotificationService {
  private initialized = false;
  private currentToken: string | null = null;

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
        this.currentToken = token.value;
        
        try {
          // Get current user
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            console.log('No active session, cannot save push token');
            return;
          }

          console.log('Managing push token for user:', session.user.id);
          
          // Determine device type
          const deviceType = isNativePlatform() 
            ? (navigator.userAgent.includes('Android') ? 'android' : 'ios') 
            : 'web';
          
          // Get existing tokens for this user
          const { data: existingTokens } = await supabase
            .from('device_tokens')
            .select('*')
            .eq('user_id', session.user.id);
            
          console.log('Existing tokens for user:', existingTokens?.length || 0);
          
          // Check if this exact token already exists
          const tokenExists = existingTokens?.some(t => t.token === token.value);
          
          if (tokenExists) {
            console.log('Token already exists for this user, updating last_updated');
            // Update the last_updated timestamp
            const { error: updateError } = await supabase
              .from('device_tokens')
              .update({ last_updated: new Date().toISOString() })
              .eq('user_id', session.user.id)
              .eq('token', token.value);
              
            if (updateError) {
              console.error('Error updating token timestamp:', updateError);
            } else {
              console.log('Token timestamp updated successfully');
            }
          } else {
            // Check if we should replace an existing token for the same device type
            const sameDeviceToken = existingTokens?.find(t => t.device_type === deviceType);
            
            if (sameDeviceToken) {
              console.log('Replacing existing token for same device type');
              
              // Update the existing record instead of creating a new one
              const { error: updateError } = await supabase
                .from('device_tokens')
                .update({ 
                  token: token.value,
                  last_updated: new Date().toISOString() 
                })
                .eq('id', sameDeviceToken.id);
                
              if (updateError) {
                console.error('Error updating device token:', updateError);
              } else {
                console.log('Device token updated successfully');
              }
            } else {
              console.log('Creating new token record for user');
              
              // Create new device token record
              const deviceToken: DeviceToken = {
                user_id: session.user.id,
                token: token.value,
                device_type: deviceType,
                last_updated: new Date().toISOString()
              };

              const { error } = await supabase
                .from('device_tokens')
                .insert(deviceToken);

              if (error) {
                console.error('Error saving push token:', error);
              } else {
                console.log('Push token saved successfully');
              }
            }
          }
          
          // Verify token was saved/updated
          const { data: savedTokens } = await supabase
            .from('device_tokens')
            .select('*')
            .eq('user_id', session.user.id);
          
          console.log('Current device tokens for user:', savedTokens);
          toast.success('Push notifications enabled');
          
        } catch (err) {
          console.error('Error managing push token:', err);
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

  // Clean up tokens when user logs out
  async clearTokens() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('No active session, nothing to clear');
        return;
      }
      
      // Delete all tokens associated with this user
      const { error } = await supabase
        .from('device_tokens')
        .delete()
        .eq('user_id', session.user.id);
        
      if (error) {
        console.error('Error clearing device tokens:', error);
      } else {
        console.log('Device tokens cleared successfully');
        this.currentToken = null;
      }
    } catch (error) {
      console.error('Error clearing tokens:', error);
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
