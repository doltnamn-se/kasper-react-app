import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";
import { StepProgress } from "./StepProgress";
import { StepContent } from "./StepContent";
import { StepNavigation } from "./StepNavigation";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { useChecklistItems } from "@/hooks/useChecklistItems";
import { supabase } from "@/integrations/supabase/client";

export const ChecklistContainer = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { t, language } = useLanguage();
  const { checklistProgress, handleStepComplete, calculateProgress, refetchProgress } = useChecklistProgress();
  const { checklistItems } = useChecklistItems();

  const handleGuideComplete = async (siteId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const completedGuides = checklistProgress?.completed_guides || [];
    
    const { error } = await supabase
      .from('customer_checklist_progress')
      .update({ 
        completed_guides: [...completedGuides, siteId] 
      })
      .eq('customer_id', session.user.id);

    if (error) {
      console.error('Error updating completed guides:', error);
      return;
    }

    await refetchProgress();
    setCurrentStep(prev => prev + 1);
  };

  const getTotalSteps = () => {
    const baseSteps = 4;
    const selectedSitesCount = checklistProgress?.selected_sites?.length || 0;
    return baseSteps + selectedSitesCount;
  };

  const getGuideForSite = (siteId: string) => {
    const guides = [
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

    return guides.find(guide => guide.title.toLowerCase().includes(siteId.toLowerCase()));
  };

  const progress = calculateProgress();
  const isChecklistCompleted = progress === 100;

  return (
    <div className="space-y-6">
      <StepProgress progress={progress} />
      <div className="step-content-wrapper relative">
        {isChecklistCompleted && (
          <div className="absolute inset-0 z-10 backdrop-blur-sm bg-white/30 dark:bg-black/30 rounded-lg flex items-center justify-center">
            <p className="text-lg font-semibold text-center px-4">
              {language === 'sv' ? 'Du är färdig med checklistan' : 'You have completed the checklist'}
            </p>
          </div>
        )}
        {[...Array(getTotalSteps())].map((_, index) => (
          <div 
            key={index + 1}
            data-step={index + 1}
            style={{ display: currentStep === index + 1 ? 'block' : 'none' }}
          >
            <StepContent
              currentStep={index + 1}
              selectedSites={checklistProgress?.selected_sites || []}
              completedGuides={checklistProgress?.completed_guides}
              onGuideComplete={handleGuideComplete}
              onStepComplete={handleStepComplete}
              checklistItems={checklistItems || []}
              getGuideForSite={getGuideForSite}
            />
          </div>
        ))}
      </div>
      <div className="py-8">
        <Separator className="bg-[#e0e0e0] dark:bg-[#3a3a3b]" />
      </div>
      <StepNavigation
        currentStep={currentStep}
        totalSteps={getTotalSteps()}
        onStepChange={setCurrentStep}
      />
    </div>
  );
};