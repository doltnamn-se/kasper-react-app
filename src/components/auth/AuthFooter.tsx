
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export const AuthFooter = () => {
  const { t } = useLanguage();

  return (
    <div className="flex justify-center gap-0.5 mb-2">
      <Button 
        variant="link" 
        className="text-xs font-medium text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] hover:no-underline"
        onClick={() => window.open('https://digitaltskydd.se/integritetspolicy/', '_blank')}
      >
        {t('privacy')}
      </Button>
      <Button 
        variant="link" 
        className="text-xs font-medium text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] hover:no-underline"
        onClick={() => window.open('https://digitaltskydd.se/licensvillkor/', '_blank')}
      >
        {t('license')}
      </Button>
      <Button 
        variant="link" 
        className="text-xs font-medium text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] hover:no-underline"
        onClick={() => window.open('https://digitaltskydd.se/anvandarvillkor/', '_blank')}
      >
        {t('terms')}
      </Button>
    </div>
  );
};
