
import { useLanguage } from "@/contexts/LanguageContext";

export const RemovedLinks = () => {
  const { t } = useLanguage();
  
  return (
    <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
      {t('deindexing.removed.links.placeholder')}
    </p>
  );
};

