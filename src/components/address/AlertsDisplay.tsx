import { useLanguage } from "@/contexts/LanguageContext";

export const AlertsDisplay = () => {
  const { language } = useLanguage();

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-6 dark:text-white">
        {language === 'sv' ? 'Larm' : 'Alarm'}
      </h2>
      <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
        {language === 'sv'
          ? 'Det finns inga tidigare larm rörande din adress'
          : 'There are no previous alarms regarding your address'
        }
      </p>
    </div>
  );
};