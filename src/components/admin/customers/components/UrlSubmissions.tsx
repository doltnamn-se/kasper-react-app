
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
    <div>
      <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6] mb-3">
        {t('url.submissions')}
      </h3>
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFFA6]">{t('total.urls')}</p>
          <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
            {usedUrls}
          </p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFFA6]">{t('urls.available')}</p>
          <p className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
            {isUnlimited ? displayLimit : `${usedUrls} / ${displayLimit}`}
          </p>
        </div>
      </div>
    </div>
  );
};
