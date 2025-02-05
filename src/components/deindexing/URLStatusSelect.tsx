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
      // Skip if status hasn't changed
      if (newStatus === currentStatus) {
        console.log('URLStatusSelect - Status unchanged, skipping update');
        return;
      }

      console.log('URLStatusSelect - handleStatusChange called with:', { 
        urlId, 
        newStatus, 
        currentStatus,
        customerId 
      });

      // First update the status
      console.log('URLStatusSelect - Calling onStatusChange');
      await onStatusChange(newStatus);
      
      // Only create notification if status was successfully updated
      console.log('URLStatusSelect - Creating notification');
      await createStatusNotification(customerId);
      
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