import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { GuideCard } from "@/components/guides/GuideCard";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface GuideStep {
  text: string;
}

interface Guide {
  title: string;
  steps: GuideStep[];
}

const Guides = () => {
  const { t, language } = useLanguage();
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const [completedGuides, setCompletedGuides] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Guider | Doltnamn.se" : 
      "Guides | Doltnamn.se";
    
    const fetchCompletedGuides = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        console.log('Fetching completed guides for user:', session.user.id);
        
        const { data, error } = await supabase
          .from('customer_checklist_progress')
          .select('completed_guides')
          .eq('customer_id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching completed guides:', error);
          return;
        }

        console.log('Fetched completed guides:', data?.completed_guides);
        setCompletedGuides(data?.completed_guides || []);
      } catch (error) {
        console.error('Error in fetchCompletedGuides:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletedGuides();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('guides_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'customer_checklist_progress',
          filter: `customer_id=eq.${supabase.auth.getSession().then(({ data }) => data.session?.user.id)}`
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          setCompletedGuides(payload.new.completed_guides || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [language]);

  const handleAccordionChange = (accordionId: string) => {
    setOpenAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accordionId)) {
        newSet.delete(accordionId);
      } else {
        newSet.add(accordionId);
      }
      return newSet;
    });
  };

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

  const guides: Guide[] = [
    {
      title: t('guide.eniro.title'),
      steps: [
        { text: 'https://uppdatera.eniro.se/person' },
        { text: t('guide.eniro.step1') },
        { text: t('guide.eniro.step2') },
        { text: t('guide.eniro.step3') }
      ]
    },
    {
      title: t('guide.mrkoll.title'),
      steps: [
        { text: 'https://mrkoll.se/om/andra-uppgifter/' },
        { text: t('guide.mrkoll.step1') },
        { text: t('guide.mrkoll.step2') }
      ]
    },
    {
      title: t('guide.hitta.title'),
      steps: [
        { text: 'https://www.hitta.se/kontakta-oss/ta-bort-kontaktsida' },
        { text: t('guide.hitta.step1') },
        { text: t('guide.hitta.step2') }
      ]
    },
    {
      title: t('guide.merinfo.title'),
      steps: [
        { text: 'https://www.merinfo.se/ta-bort-mina-uppgifter' },
        { text: t('guide.merinfo.step1') }
      ]
    },
    {
      title: t('guide.ratsit.title'),
      steps: [
        { text: 'https://www.ratsit.se/redigera/dolj' },
        { text: t('guide.ratsit.step1') },
        { text: t('guide.ratsit.step2') }
      ]
    },
    {
      title: t('guide.birthday.title'),
      steps: [
        { text: 'https://www.birthday.se/kontakta' },
        { text: t('guide.birthday.step1') },
        { text: t('guide.birthday.step2') }
      ]
    },
    {
      title: t('guide.upplysning.title'),
      steps: [
        { text: 'https://www.upplysning.se/kontakta-oss' },
        { text: t('guide.upplysning.step1') },
        { text: t('guide.upplysning.step2') }
      ]
    }
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  const leftColumnGuides = guides.filter((_, index) => index % 2 === 0);
  const rightColumnGuides = guides.filter((_, index) => index % 2 === 1);

  return (
    <MainLayout>
      <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.guides')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          {leftColumnGuides.map((guide, index) => (
            <GuideCard
              key={index}
              guide={guide}
              accordionId={`left-${index}`}
              isOpen={openAccordions.has(`left-${index}`)}
              onAccordionChange={handleAccordionChange}
              isCompleted={completedGuides.includes(getGuideId(guide.title))}
            />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {rightColumnGuides.map((guide, index) => (
            <GuideCard
              key={index}
              guide={guide}
              accordionId={`right-${index}`}
              isOpen={openAccordions.has(`right-${index}`)}
              onAccordionChange={handleAccordionChange}
              isCompleted={completedGuides.includes(getGuideId(guide.title))}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Guides;