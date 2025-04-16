
import { PushNotifications } from '@capacitor/push-notifications';
import { isNativePlatform } from '@/capacitor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Service for handling push notifications
class PushNotificationService {
  private initialized = false;
  private registerPromise: Promise<void> | null = null;

  // Register device for push notifications and handle events
  async register() {
    if (!isNativePlatform()) {
      console.log('Push notifications are only available on native platforms');
      return;
    }

    if (this.registerPromise) {
      console.log('Registration already in progress, returning existing promise');
      return this.registerPromise;
    }

    if (this.initialized) {
      console.log('Push notifications already initialized');
      return;
    }

    console.log('Starting push notification registration process');
    
    // Create a single registration promise that we can reuse
    this.registerPromise = this._register();
    return this.registerPromise;
  }

  // Internal registration method
  private async _register() {
    try {
      console.log('Initializing push notifications...');
      
      // Check auth state first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('No active session, cannot register for push notifications');
        this.registerPromise = null;
        return;
      }
      console.log('User authenticated:', session.user.id);

      // Request permission to use push notifications
      console.log('Requesting push notification permissions');
      const permission = await PushNotifications.requestPermissions();
      console.log('Push notification permission status:', permission);

      if (permission.receive !== 'granted') {
        console.error('Push notification permission not granted');
        this.registerPromise = null;
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
      toast('Notification Error: Failed to register for push notifications');
      this.initialized = false;
      this.registerPromise = null;
    }
  }

  // Set up listeners for push notification events
  private setupListeners() {
    // On registration success, save the token to the database
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token received:', token.value);
      
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.error('No active session, cannot save push token');
          return;
        }

        console.log('Saving token to database for user:', session.user.id);
        
        // Debug: Verify the token is well-formed
        if (!token.value || token.value.length < 10) {
          console.error('Invalid token received:', token.value);
          return;
        }

        // Save token directly with an explicit insert
        const insertResult = await supabase
          .from('device_tokens')
          .insert({
            user_id: session.user.id,
            token: token.value,
            device_type: navigator.userAgent.includes('Android') ? 'android' : 'ios'
          });
          
        if (insertResult.error) {
          console.error('Error saving push token:', insertResult.error);
          
          // Try again with upsert if insert failed
          const upsertResult = await supabase
            .from('device_tokens')
            .upsert({
              user_id: session.user.id,
              token: token.value,
              device_type: navigator.userAgent.includes('Android') ? 'android' : 'ios',
              last_updated: new Date().toISOString()
            }, {
              onConflict: 'user_id, token'
            });
            
          if (upsertResult.error) {
            console.error('Second attempt to save token failed:', upsertResult.error);
          } else {
            console.log('Push token saved on second attempt');
            this.verifyTokenSaved(session.user.id, token.value);
          }
        } else {
          console.log('Push token saved successfully on first attempt');
          this.verifyTokenSaved(session.user.id, token.value);
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
        toast(`${notification.title}: ${notification.body}`);
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
      toast('Registration Error: Failed to register for push notifications');
    });
  }

  // Verify token was saved correctly
  private async verifyTokenSaved(userId: string, tokenValue: string) {
    try {
      const { data: savedTokens, error: verifyError } = await supabase
        .from('device_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('token', tokenValue);
      
      if (verifyError) {
        console.error('Error verifying saved token:', verifyError);
      } else {
        console.log('Token verification result:', savedTokens);
      }
    } catch (err) {
      console.error('Error verifying token:', err);
    }
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
