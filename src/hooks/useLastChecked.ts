
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export const useLastChecked = () => {
  const [lastChecked, setLastChecked] = useState(new Date());
  const { language } = useLanguage();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Översikt | Kasper" : 
      "Overview | Kasper";
      
    const now = new Date();
    const minutes = now.getMinutes();
    const currentInterval = minutes - (minutes % 5);
    
    const lastInterval = new Date(now);
    lastInterval.setMinutes(currentInterval);
    lastInterval.setSeconds(0);
    lastInterval.setMilliseconds(0);
    setLastChecked(lastInterval);
  }, [language]);

  return { lastChecked };
};
