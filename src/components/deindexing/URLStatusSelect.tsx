import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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

  const handleStatusChange = async (newStatus: URLStatusStep) => {
    try {
      console.log('Updating URL status:', { urlId, newStatus });
      
      // Get translated status text for notification
      const translatedStatus = getStatusText(newStatus, t);
      
      // Create notification for status change
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: customerId,
          title: t('notifications.url.status.title'),
          message: t('notifications.url.status.message', { status: translatedStatus }),
          type: 'removal',
          read: false
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        toast({
          title: t('error'),
          description: t('error.update.status'),
          variant: "destructive",
        });
      }

      onStatusChange(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: t('error'),
        description: t('error.unexpected'),
        variant: "destructive",
      });
    }
  };

  return (
    <Select defaultValue={currentStatus || 'received'} onValueChange={handleStatusChange}>
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