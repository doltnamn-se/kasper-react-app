import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGuideData } from "@/hooks/useGuideData";
import { ChecklistProgress } from "@/components/checklist/ChecklistProgress";
import { ChecklistSites } from "@/components/checklist/ChecklistSites";
import { GuideStepContent } from "@/components/checklist/steps/GuideStepContent";
import { LoadingState } from "@/components/guides/LoadingState";

const Checklist = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { getGuides } = useGuideData();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);

  const { data: completedGuides = [], isLoading, refetch } = useQuery({
    queryKey: ['completed-guides'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data, error } = await supabase
        .from('customer_checklist_progress')
        .select('completed_guides')
        .eq('customer_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching completed guides:', error);
        return [];
      }

      return data?.completed_guides || [];
    }
  });

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Checklista | Doltnamn.se" : 
      "Checklist | Doltnamn.se";

    const root = document.getElementById('root');
    if (root) {
      root.classList.add('animate-fadeIn');
    }
  }, [language]);

  const handleSiteSelection = (sites: string[]) => {
    setSelectedSites(sites);
    setCurrentStep(2);
  };

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleGuideComplete = async (siteId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('auth.required'),
      });
      return;
    }

    const newCompletedGuides = [...(completedGuides || []), siteId];

    const { error } = await supabase
      .from('customer_checklist_progress')
      .upsert({
        customer_id: session.user.id,
        completed_guides: newCompletedGuides
      });

    if (error) {
      console.error('Error updating completed guides:', error);
      throw error;
    }

    await refetch();
  };

  const getGuideForSite = (siteId: string) => {
    const guides = getGuides();
    return guides.find(guide => siteId === guide.title);
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
        <div className="checklist-page">
          <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
            {t('nav.checklist')}
          </h1>

          <div className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
            <ChecklistProgress
              currentStep={currentStep}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
              selectedSites={selectedSites}
              completedGuides={completedGuides}
            />

            {currentStep === 1 && (
              <ChecklistSites
                onSiteSelection={handleSiteSelection}
                selectedSites={selectedSites}
                completedGuides={completedGuides}
              />
            )}

            {currentStep >= 4 && currentStep <= selectedSites.length + 3 && (
              <GuideStepContent
                currentStep={currentStep}
                selectedSites={selectedSites}
                completedGuides={completedGuides}
                onGuideComplete={handleGuideComplete}
                getGuideForSite={getGuideForSite}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checklist;