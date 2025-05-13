
import { useLanguage } from "@/contexts/LanguageContext";

export const useGuideUtils = () => {
  const { t } = useLanguage();

  const getGuideId = (title: string): string => {
    const titleToId: { [key: string]: string } = {
      [t('guide.eniro.title')]: 'eniro',
      [t('guide.mrkoll.title')]: 'mrkoll',
      [t('guide.hitta.title')]: 'hitta',
      [t('guide.merinfo.title')]: 'merinfo',
      [t('guide.ratsit.title')]: 'ratsit',
      [t('guide.birthday.title')]: 'birthday'
      // Removed upplysning entry
    };
    return titleToId[title] || '';
  };

  const shouldShowCopyButton = (guideTitle: string, stepText: string): boolean => {
    // Only Birthday guide should have copy button now that upplysning is removed
    const isBirthday = guideTitle === t('guide.birthday.title');
    return isBirthday && stepText.includes('\"');
  };

  return {
    getGuideId,
    shouldShowCopyButton
  };
};
