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
    
    const historyEntry = statusHistory?.find(entry => {
      const mappedStatus = entry.status === 'case_started' ? 'in_progress' : 
                          entry.status === 'removal_approved' ? 'completed' : 
                          entry.status === 'request_submitted' ? 'request_submitted' :
                          entry.status;
      return mappedStatus === step;
    });
    
    console.log('History entry found for step', step, ':', historyEntry);
    
    if (historyEntry?.timestamp) {
      try {
        const formattedTime = formatDistanceToNow(new Date(historyEntry.timestamp), {
          addSuffix: true,
          locale: language === 'sv' ? sv : enUS
        });
        console.log('Formatted time for step', step, ':', formattedTime);
        return formattedTime;
      } catch (error) {
        console.error('Error formatting timestamp for step', step, ':', error);
        return '';
      }
    }
    return '';
  };

  return { getTimestampForStep };
};