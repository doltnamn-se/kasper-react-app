
import { formatInTimeZone } from "date-fns-tz";
import { sv, enUS } from "date-fns/locale";

// Swedish timezone
export const SWEDISH_TIMEZONE = "Europe/Stockholm";

// Format date based on language with timezone conversion
export const formatDateWithLocale = (date: Date, language: string): string => {
  if (isNaN(date.getTime())) {
    return ""; // Return empty string for invalid dates
  }
  
  return language === 'en'
    ? formatInTimeZone(date, SWEDISH_TIMEZONE, "MMM d, yyyy", { locale: enUS })
    : formatInTimeZone(date, SWEDISH_TIMEZONE, "d MMM yyyy", { locale: sv }).replace('.', '');
};
