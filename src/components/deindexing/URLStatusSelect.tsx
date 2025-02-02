import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { URLStatusStep } from "@/types/url-management";
import { getStatusText } from "./utils/statusUtils";
import { useUrlNotifications } from "./hooks/useUrlNotifications";

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
      console.log('Updating URL status:', { urlId, newStatus, currentStatus });
      
      // Only create notification if status actually changed
      if (newStatus !== currentStatus) {
        // Get translated status text for notification
        const translatedStatus = getStatusText(newStatus, t);
        console.log('Creating notification with translated status:', translatedStatus);

        // Create notification for status change using the hook
        await createStatusNotification(customerId, translatedStatus);
      }
      
      onStatusChange(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      showErrorToast();
    }
  };

  return (
    <Select defaultValue={currentStatus} onValueChange={handleStatusChange}>
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