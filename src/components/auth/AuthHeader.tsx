import { useLanguage } from "@/contexts/LanguageContext";
import { AuthLogo } from "./AuthLogo";

export const AuthHeader = () => {
  const { t } = useLanguage();

  return (
    <div className="text-center space-y-6">
      <AuthLogo />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          {t('welcome.back')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('sign.in')}</p>
      </div>
    </div>
  );
};