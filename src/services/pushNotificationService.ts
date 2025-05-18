
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
          // Verify authentication before proceeding
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            console.log('No active session, cannot save push token');
            return;
          }

          // Double check user ID is valid UUID format
          const userId = session.user.id;
          if (!userId || !this.isValidUUID(userId)) {
            console.error('Invalid user ID format:', userId);
            return;
          }

          console.log('Managing push token for authenticated user:', userId);
          
          // Determine device type
          const deviceType = isNativePlatform() 
            ? (navigator.userAgent.includes('Android') ? 'android' : 'ios') 
            : 'web';
          
          // First check if this exact token already exists for this user
          const { data: existingToken, error: queryError } = await supabase
            .from('device_tokens')
            .select('*')
            .eq('token', token.value)
            .single();
            
          if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error checking existing token:', queryError);
          }
          
          if (existingToken) {
            console.log('Found existing token record:', existingToken);
            
            // If token exists but has wrong user_id, update it
            if (existingToken.user_id !== userId) {
              console.warn('Token exists but with incorrect user_id. Fixing...');
              console.log(`Updating token user_id from ${existingToken.user_id} to ${userId}`);
              
              const { error: updateError } = await supabase
                .from('device_tokens')
                .update({ 
                  user_id: userId,
                  last_updated: new Date().toISOString() 
                })
                .eq('id', existingToken.id);
                
              if (updateError) {
                console.error('Error updating token user_id:', updateError);
              } else {
                console.log('Token user_id fixed successfully');
                toast.success('Push notifications enabled');
              }
            } else {
              // Just update the timestamp
              const { error: updateError } = await supabase
                .from('device_tokens')
                .update({ last_updated: new Date().toISOString() })
                .eq('id', existingToken.id);
                
              if (updateError) {
                console.error('Error updating token timestamp:', updateError);
              } else {
                console.log('Token timestamp updated successfully');
                toast.success('Push notifications enabled');
              }
            }
          } else {
            // Check if user already has a token for this device type
            const { data: userTokens } = await supabase
              .from('device_tokens')
              .select('*')
              .eq('user_id', userId)
              .eq('device_type', deviceType);
            
            if (userTokens && userTokens.length > 0) {
              console.log(`User already has ${userTokens.length} tokens for ${deviceType}. Updating existing...`);
              
              // Update the most recently updated token
              const mostRecentToken = userTokens.sort((a, b) => 
                new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
              )[0];
              
              const { error: updateError } = await supabase
                .from('device_tokens')
                .update({ 
                  token: token.value,
                  last_updated: new Date().toISOString() 
                })
                .eq('id', mostRecentToken.id);
                
              if (updateError) {
                console.error('Error updating device token:', updateError);
              } else {
                console.log('Device token updated successfully');
                toast.success('Push notifications enabled');
              }
            } else {
              console.log('Creating new token record for user');
              
              // Create new device token record
              const deviceToken: DeviceToken = {
                user_id: userId,
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
                toast.success('Push notifications enabled');
              }
            }
          }
          
          // Verify all tokens for this user as a final check
          await this.debugTokens();
          
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

  // Fix tokens with incorrect user IDs
  async fixTokenMismatch() {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('No active session, cannot fix tokens');
        return;
      }

      const currentUserId = session.user.id;
      console.log('Checking for token mismatches for user:', currentUserId);
      
      // Get current device info
      const deviceType = isNativePlatform() 
        ? (navigator.userAgent.includes('Android') ? 'android' : 'ios') 
        : 'web';
      
      // Get the current token if available
      if (!this.currentToken) {
        console.log('No current token available, cannot fix mismatches');
        return;
      }
      
      // Find any tokens that match the current token but have wrong user_id
      const { data: tokensWithSameValue } = await supabase
        .from('device_tokens')
        .select('*')
        .eq('token', this.currentToken);
      
      if (tokensWithSameValue && tokensWithSameValue.length > 0) {
        console.log(`Found ${tokensWithSameValue.length} tokens with the same value`);
        
        // Update any tokens with the wrong user_id
        for (const tokenRecord of tokensWithSameValue) {
          if (tokenRecord.user_id !== currentUserId) {
            console.log(`Fixing token ${tokenRecord.id}: changing user_id from ${tokenRecord.user_id} to ${currentUserId}`);
            
            const { error } = await supabase
              .from('device_tokens')
              .update({ user_id: currentUserId, last_updated: new Date().toISOString() })
              .eq('id', tokenRecord.id);
              
            if (error) {
              console.error(`Error fixing token ${tokenRecord.id}:`, error);
            } else {
              console.log(`Successfully fixed token ${tokenRecord.id}`);
            }
          }
        }
      } else {
        console.log('No tokens found with the current token value');
      }
      
      // As a final check, verify all tokens
      await this.debugTokens();
      
    } catch (error) {
      console.error('Error fixing token mismatches:', error);
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
        
      console.log('Debug - Device tokens for user:', session.user.id);
      console.log('Debug - Token data:', data);
      console.log('Debug - Token error:', error);
      
      return data;
    } catch (error) {
      console.error('Error debugging tokens:', error);
      return null;
    }
  }
  
  // Helper method to validate UUID format
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

export const pushNotificationService = new PushNotificationService();
