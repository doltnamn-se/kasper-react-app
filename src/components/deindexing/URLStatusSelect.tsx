
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { URLStatusStep } from "@/types/url-management";
import { getStatusText } from "./utils/statusUtils";

interface URLStatusSelectProps {
  currentStatus: string;
  urlId: string;
  customerId: string;
  onStatusChange: (newStatus: string) => void;
}

export const URLStatusSelect = ({ currentStatus, urlId, customerId, onStatusChange }: URLStatusSelectProps) => {
  const { t } = useLanguage();

  const getStatusColors = (status: string) => {
    const statusColors = {
      'received': "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      'case_started': "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      'in_progress': "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      'request_submitted': "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      'removal_approved': "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
      'completed': "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
    };

    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800";
  };

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

      // Call onStatusChange which will handle notification creation with the removal type
      console.log('URLStatusSelect - Calling onStatusChange');
      await onStatusChange(newStatus);
      
    } catch (error) {
      console.error('URLStatusSelect - Error in handleStatusChange:', error);
    }
  };

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className={`min-w-[140px] w-auto h-8 text-xs whitespace-nowrap font-medium ${getStatusColors(currentStatus)}`}>
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
