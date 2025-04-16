
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { URLStatusStep } from "@/types/url-management";
import { getStatusText } from "./utils/statusUtils";
import { useUrlNotifications } from "./hooks/useUrlNotifications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface URLStatusSelectProps {
  currentStatus: string;
  urlId: string;
  customerId: string;
  onStatusChange: (newStatus: string) => void;
}

export const URLStatusSelect = ({ currentStatus, urlId, customerId, onStatusChange }: URLStatusSelectProps) => {
  const { t, language } = useLanguage();
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

      // Prepare notification content
      const title = language === 'sv' ? "Länkstatus uppdaterad" : "Link status updated";
      const message = language === 'sv' 
        ? "Processen har gått framåt för en eller flera av dina länkar. Logga in på ditt konto för att se mer."
        : "The process has progressed for one or more of your links. Log in to your account to see more.";
      
      // Call the notification utility from the hook
      await createStatusNotification(
        customerId,
        title,
        message
      );
      
      console.log('URLStatusSelect - Notification created successfully');
      
      toast.success(t('success'), {
        description: t('success.update.status')
      });
    } catch (error) {
      console.error('URLStatusSelect - Error in handleStatusChange:', error);
      showErrorToast();
    }
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
