
import { formatDistanceToNow } from "date-fns";
import { sv, enUS } from "date-fns/locale";
import { URLStatusHistory } from "@/types/url-management";

interface TimestampHandlerProps {
  statusHistory?: URLStatusHistory[];
  language: string;
}

export const useTimestampHandler = ({ statusHistory = [], language }: TimestampHandlerProps) => {
  const getTimestampForStep = (step: string) => {
    console.log('Getting timestamp for step:', step);
    console.log('Status history:', statusHistory);
    
    // Map the step to the corresponding status in history
    const statusMap: { [key: string]: string } = {
      'received': 'received',
      'in_progress': 'case_started',
      'request_submitted': 'request_submitted',
      'completed': 'removal_approved'
    };

    const historyEntry = statusHistory?.find(entry => {
      const targetStatus = statusMap[step];
      return entry.status === targetStatus;
    });
    
    console.log('History entry found for step', step, ':', historyEntry);

    // If we're looking for the 'received' step and there's no history entry,
    // use the first entry's timestamp or fall back to the current time
    if (step === 'received' && !historyEntry?.timestamp) {
      const firstEntry = statusHistory?.[0];
      if (firstEntry?.timestamp) {
        try {
          const formattedTime = formatDistanceToNow(new Date(firstEntry.timestamp), {
            addSuffix: true,
            locale: language === 'sv' ? sv : enUS,
          });
          console.log('Formatted time for received step:', formattedTime);
          return formattedTime.replace('about ', '').replace('ungefär ', '');
        } catch (error) {
          console.error('Error formatting timestamp for received step:', error);
          return '';
        }
      }
    }
    
    if (historyEntry?.timestamp) {
      try {
        const formattedTime = formatDistanceToNow(new Date(historyEntry.timestamp), {
          addSuffix: true,
          locale: language === 'sv' ? sv : enUS,
        });
        console.log('Formatted time for step', step, ':', formattedTime);
        return formattedTime.replace('about ', '').replace('ungefär ', '');
      } catch (error) {
        console.error('Error formatting timestamp for step', step, ':', error);
        return '';
      }
    }
    return '';
  };

  return { getTimestampForStep };
};
