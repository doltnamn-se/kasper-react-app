
import { useLanguage } from "@/contexts/LanguageContext";

export interface SiteStatusManagerProps {
  customerId: string;
}

export const SiteStatusManager = ({ customerId }: SiteStatusManagerProps) => {
  const { t } = useLanguage();
  
  return (
    <div>
      <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFF] mb-3">{t('site.statuses')}</h3>
      <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">Status management</p>
    </div>
  );
};
