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
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-normal hover:no-underline"
          onClick={() => window.open('https://doltnamn.se/integritetspolicy/', '_blank')}
        >
          {t('privacy')}
        </Button>
        <Button 
          variant="link" 
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-normal hover:no-underline"
          onClick={() => window.open('https://doltnamn.se/licensvillkor/', '_blank')}
        >
          {t('license')}
        </Button>
        <Button 
          variant="link" 
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-normal hover:no-underline"
          onClick={() => window.open('https://doltnamn.se/anvandarvillkor/', '_blank')}
        >
          {t('terms')}
        </Button>
      </div>
      <p className="text-[11px] text-gray-400">
        {currentYear} © Doltnamn.se &nbsp;&nbsp;·&nbsp;&nbsp; App version {version}
      </p>
    </div>
  );
};