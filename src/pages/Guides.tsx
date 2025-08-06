
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
      "Guider | Kasper" : 
      "Guides | Kasper";
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
      <h1 className="mb-6">
        {t('nav.guides')}
      </h1>
      <GuideGrid
        guides={getGuides()}
        openAccordions={openAccordions}
        onAccordionChange={handleAccordionChange}
        completedGuides={completedGuides}
      />
    </MainLayout>
  );
};

export default Guides;
