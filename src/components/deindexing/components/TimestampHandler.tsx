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
    
    const historyEntry = statusHistory.find(entry => {
      const mappedStatus = entry.status === 'case_started' ? 'in_progress' : 
                          entry.status === 'removal_approved' ? 'completed' : 
                          entry.status;
      return mappedStatus === step;
    });
    
    console.log('History entry found:', historyEntry);
    
    if (historyEntry) {
      try {
        return formatDistanceToNow(new Date(historyEntry.timestamp), {
          addSuffix: true,
          locale: language === 'sv' ? sv : enUS
        });
      } catch (error) {
        console.error('Error formatting timestamp:', error);
        return '';
      }
    }
    return '';
  };

  return { getTimestampForStep };
};