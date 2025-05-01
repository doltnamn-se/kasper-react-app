
import { useLanguage } from "@/contexts/LanguageContext";

interface UrlSubmissionsProps {
  usedUrls: number;
  totalUrlLimit: number;
}

export const UrlSubmissions = ({ usedUrls, totalUrlLimit }: UrlSubmissionsProps) => {
  const { t } = useLanguage();
  
  // Check if the user has unlimited URLs (very high number)
  const isUnlimited = totalUrlLimit > 10000;
  const displayLimit = isUnlimited ? t('unlimited') : totalUrlLimit.toString();

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col">
          <p className="text-xs font-normal text-[#000000] dark:text-[#FFFFFF]">{t('url.count')}</p>
          <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF] mt-1">
            {usedUrls}
          </p>
        </div>
        
        <div className="flex flex-col">
          <p className="text-xs font-normal text-[#000000] dark:text-[#FFFFFF]">{t('url.limit')}</p>
          <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF] mt-1">
            {isUnlimited ? displayLimit : `${usedUrls} / ${displayLimit}`}
          </p>
        </div>
      </div>
    </div>
  );
};
