import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface URLStatusSelectProps {
  currentStatus: string;
  urlId: string;
  customerId: string;
  onStatusChange: (newStatus: string) => void;
}

export const URLStatusSelect = ({ currentStatus, urlId, customerId, onStatusChange }: URLStatusSelectProps) => {
  const { t } = useLanguage();

  const handleStatusChange = async (newStatus: string) => {
    try {
      console.log('Updating URL status:', { urlId, newStatus });
      
      // Create notification for status change
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: customerId,
          title: t('notifications.url.status.title'),
          message: t('notifications.url.status.message', { status: newStatus }),
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
    <Select defaultValue={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="received">Received</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
        <SelectItem value="failed">Failed</SelectItem>
      </SelectContent>
    </Select>
  );
};