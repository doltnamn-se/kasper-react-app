
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVersionStore } from "@/config/version";

export const AuthFooter = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  const version = useVersionStore((state) => state.version);

  return (
    <div className="flex flex-col items-center space-y-3">
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
      <p className="text-[11px] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
        {currentYear} © Digitaltskydd.se &nbsp;&nbsp;·&nbsp;&nbsp; App version {version}
      </p>
    </div>
  );
};
