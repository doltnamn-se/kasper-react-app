import { useLanguage } from "@/contexts/LanguageContext";
interface UrlSubmissionsProps {
  usedUrls: number;
  totalUrlLimit: number;
}
export const UrlSubmissions = ({
  usedUrls,
  totalUrlLimit
}: UrlSubmissionsProps) => {
  const {
    t
  } = useLanguage();

  // Check if the user has unlimited URLs (very high number)
  const isUnlimited = totalUrlLimit > 10000;
  const displayLimit = isUnlimited ? t('unlimited') : totalUrlLimit.toString();
  return <div className="space-y-4">
      <div className="space-y-2">
        {/* Labels row */}
        <div className="grid grid-cols-2 gap-2">
          <p className="text-xs font-normal text-[#000000] dark:text-[#FFFFFF]">{t('url.count')}</p>
          <p className="text-xs font-normal text-[#000000] dark:text-[#FFFFFF]">{t('url.limit')}</p>
        </div>
        
        {/* Values row - each value is aligned under its corresponding label */}
        <div className="grid grid-cols-2 gap-2">
          <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
            {usedUrls}
          </p>
          <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
            {isUnlimited ? displayLimit : `${usedUrls} / ${displayLimit}`}
          </p>
        </div>
      </div>
    </div>;
};