import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GuideGrid } from "@/components/guides/GuideGrid";
import { LoadingState } from "@/components/guides/LoadingState";
import { useGuideData } from "@/hooks/useGuideData";

const Guides = () => {
  const { t, language } = useLanguage();
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const { getGuides } = useGuideData();

  const { data: completedGuides = [], isLoading } = useQuery({
    queryKey: ['completed-guides'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      console.log('Fetching completed guides for user:', session.user.id);
      
      const { data, error } = await supabase
        .from('customer_checklist_progress')
        .select('completed_guides')
        .eq('customer_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching completed guides:', error);
        return [];
      }

      console.log('Fetched completed guides:', data?.completed_guides);
      return data?.completed_guides || [];
    }
  });

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Guider | Doltnamn.se" : 
      "Guides | Doltnamn.se";

    const root = document.getElementById('root');
    if (root) {
      root.classList.add('animate-fadeIn');
    }
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

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingState />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('nav.guides')}
        </h1>
        <GuideGrid
          guides={getGuides()}
          openAccordions={openAccordions}
          onAccordionChange={handleAccordionChange}
          completedGuides={completedGuides}
        />
      </div>
    </MainLayout>
  );
};

export default Guides;