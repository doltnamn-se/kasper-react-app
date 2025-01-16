import { useLanguage } from "@/contexts/LanguageContext";

export const SignUpPrompt = () => {
  const { t } = useLanguage();
  
  return (
    <div className="mt-6 text-center text-sm">
      <span className="text-gray-600 dark:text-gray-400">{t('no.account')}</span>
      {' '}
      <a
        href="https://doltnamn.se"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-black hover:text-gray-900 dark:text-white dark:hover:text-gray-300"
      >
        {t('register')}
      </a>
    </div>
  );
};