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
      [t('guide.birthday.title')]: 'birthday',
      [t('guide.upplysning.title')]: 'upplysning'
    };
    return titleToId[title] || '';
  };

  const shouldShowCopyButton = (guideTitle: string, stepText: string): boolean => {
    const isBirthdayOrUpplysning = 
      guideTitle === t('guide.birthday.title') || 
      guideTitle === t('guide.upplysning.title');
    return isBirthdayOrUpplysning && stepText.includes('\"');
  };

  return {
    getGuideId,
    shouldShowCopyButton
  };
};