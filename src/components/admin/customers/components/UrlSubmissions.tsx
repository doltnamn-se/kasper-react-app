
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
      <div className="space-y-2">
        <p className="text-xs font-medium flex justify-between">
          <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('total.urls')}</span>
          <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
            {usedUrls}
          </span>
        </p>
        <p className="text-xs font-medium flex justify-between">
          <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('urls.available')}</span>
          <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
            {isUnlimited ? displayLimit : `${usedUrls} / ${displayLimit}`}
          </span>
        </p>
      </div>
    </div>
  );
};
