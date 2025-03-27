
import { useLanguage } from "@/contexts/LanguageContext";

export const useGuideService = () => {
  const { t } = useLanguage();

  const getGuideForSite = (siteId: string) => {
    const guides = {
      'eniro': {
        title: t('guide.eniro.title'),
        steps: [
          { text: 'https://uppdatera.eniro.se/person' },
          { text: t('guide.eniro.step1') },
          { text: t('guide.eniro.step2') },
          { text: t('guide.eniro.step3') }
        ]
      },
      'mrkoll': {
        title: t('guide.mrkoll.title'),
        steps: [
          { text: 'https://mrkoll.se/om/andra-uppgifter/' },
          { text: t('guide.mrkoll.step1') },
          { text: t('guide.mrkoll.step2') }
        ]
      },
      'hitta': {
        title: t('guide.hitta.title'),
        steps: [
          { text: 'https://www.hitta.se/kontakta-oss/ta-bort-kontaktsida' },
          { text: t('guide.hitta.step1') },
          { text: t('guide.hitta.step2') }
        ]
      },
      'merinfo': {
        title: t('guide.merinfo.title'),
        steps: [
          { text: 'https://www.merinfo.se/ta-bort-mina-uppgifter' },
          { text: t('guide.merinfo.step1') }
        ]
      },
      'ratsit': {
        title: t('guide.ratsit.title'),
        steps: [
          { text: 'https://www.ratsit.se/redigera/dolj' },
          { text: t('guide.ratsit.step1') },
          { text: t('guide.ratsit.step2') }
        ]
      },
      'birthday': {
        title: t('guide.birthday.title'),
        steps: [
          { text: 'https://app.minauppgifter.se/birthday/bankidlogin' },
          { text: t('guide.birthday.step1') },
          { text: t('guide.birthday.step2') }
        ]
      },
      'upplysning': {
        title: t('guide.upplysning.title'),
        steps: [
          { text: 'https://www.upplysning.se/kontakta-oss' },
          { text: t('guide.upplysning.step1') },
          { text: t('guide.upplysning.step2') }
        ]
      }
    };

    console.log('GuideService - Getting guide for site:', siteId);
    const guide = guides[siteId as keyof typeof guides];
    console.log('GuideService - Found guide:', guide);
    return guide;
  };

  return { getGuideForSite };
};
