
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { openUrl } from "@/services/browserService";

export const AuthFooter = () => {
  const { t } = useLanguage();

  return (
    <div className="flex justify-center gap-0.5 mb-2">
      <Button 
        variant="link" 
        className="text-xs font-medium text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] hover:no-underline"
        onClick={() => openUrl('https://joinkasper.com/integritetspolicy/')}
      >
        {t('privacy')}
      </Button>
      <Button 
        variant="link" 
        className="text-xs font-medium text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] hover:no-underline"
        onClick={() => openUrl('https://joinkasper.com/licensvillkor/')}
      >
        {t('license')}
      </Button>
      <Button 
        variant="link" 
        className="text-xs font-medium text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] hover:no-underline"
        onClick={() => openUrl('https://joinkasper.com/anvandarvillkor/')}
      >
        {t('terms')}
      </Button>
    </div>
  );
};
