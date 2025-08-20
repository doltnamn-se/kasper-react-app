import { format, isToday, isYesterday } from 'date-fns';

export const formatChatTimestamp = (date: Date, translations: { today: string; yesterday: string }) => {
  const time = format(date, 'HH:mm');
  
  if (isToday(date)) {
    return `${translations.today} - ${time}`;
  }
  
  if (isYesterday(date)) {
    return `${translations.yesterday} - ${time}`;
  }
  
  return format(date, 'MMM dd, yyyy - HH:mm');
};