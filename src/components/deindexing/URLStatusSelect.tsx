
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { URLStatusStep } from "@/types/url-management";
import { getStatusText } from "./utils/statusUtils";
import { useUrlNotifications } from "./hooks/useUrlNotifications";
import { supabase } from "@/integrations/supabase/client";

interface URLStatusSelectProps {
  currentStatus: string;
  urlId: string;
  customerId: string;
  onStatusChange: (newStatus: string) => void;
}

export const URLStatusSelect = ({ currentStatus, urlId, customerId, onStatusChange }: URLStatusSelectProps) => {
  const { t } = useLanguage();
  const { createStatusNotification, showErrorToast } = useUrlNotifications();

  const handleStatusChange = async (newStatus: URLStatusStep) => {
    try {
      console.log('URLStatusSelect - handleStatusChange called with:', { 
        urlId, 
        newStatus, 
        currentStatus,
        customerId 
      });
      
      // Skip if status hasn't changed
      if (newStatus === currentStatus) {
        console.log('URLStatusSelect - Status unchanged, skipping update');
        return;
      }

      // First update the status
      console.log('URLStatusSelect - Calling onStatusChange');
      onStatusChange(newStatus);
      
      console.log('URLStatusSelect - Creating notification');
      
      // Create the notification in the database
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: customerId,
          title: t('deindexing.status.notification.title'),
          message: t('deindexing.status.notification.message', { 
            status: getStatusText(newStatus, t)
          }),
          type: 'removal',
          read: false
        })
        .select()
        .single();

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        throw notificationError;
      }

      console.log('Notification created successfully:', notificationData);

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
        body: {
          email: await getUserEmail(customerId),
          title: t('deindexing.status.notification.title'),
          message: t('deindexing.status.notification.message', { 
            status: getStatusText(newStatus, t)
          }),
          type: 'removal'
        }
      });

      if (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't throw here - we still created the in-app notification successfully
      }
      
    } catch (error) {
      console.error('URLStatusSelect - Error in handleStatusChange:', error);
      showErrorToast();
    }
  };

  // Helper function to get user's email
  const getUserEmail = async (userId: string) => {
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
    if (error) throw error;
    return user?.email;
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px] bg-background">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="received">{t('deindexing.status.received')}</SelectItem>
        <SelectItem value="case_started">{t('deindexing.status.case.started')}</SelectItem>
        <SelectItem value="request_submitted">{t('deindexing.status.request.submitted')}</SelectItem>
        <SelectItem value="removal_approved">{t('deindexing.status.removal.approved')}</SelectItem>
      </SelectContent>
    </Select>
  );
};
