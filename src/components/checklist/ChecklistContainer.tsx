import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PasswordUpdateForm } from "./PasswordUpdateForm";
import { HidingSitesSelection } from "./HidingSitesSelection";
import { UrlSubmission } from "./UrlSubmission";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { GuideCard } from "@/components/guides/GuideCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight } from "lucide-react";
import confetti from 'canvas-confetti';

interface ChecklistProgress {
  password_updated: boolean;
  selected_sites: string[];
  removal_urls: string[];
  address: string | null;
  is_address_hidden: boolean;
  personal_number: string | null;
  completed_at: string | null;
  completed_guides: string[] | null;
}

export const ChecklistContainer = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  const { data: checklistItems } = useQuery({
    queryKey: ['checklist-items'],
    queryFn: async () => {
      console.log('Fetching checklist items...');
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .order('order_index');
      
      if (error) {
        console.error('Error fetching checklist items:', error);
        throw error;
      }
      
      console.log('Checklist items fetched:', data);
      return data;
    }
  });

  const { data: checklistProgress, refetch: refetchProgress } = useQuery({
    queryKey: ['checklist-progress'],
    queryFn: async () => {
      console.log('Fetching checklist progress...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { data, error } = await supabase
        .from('customer_checklist_progress')
        .select('*')
        .eq('customer_id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching checklist progress:', error);
        throw error;
      }

      if (!data) {
        const { data: newProgress, error: insertError } = await supabase
          .from('customer_checklist_progress')
          .insert([{ customer_id: session.user.id }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating checklist progress:', insertError);
          throw insertError;
        }

        return newProgress as ChecklistProgress;
      }
      
      console.log('Checklist progress fetched:', data);
      return data as ChecklistProgress;
    }
  });

  const handleStepComplete = async () => {
    console.log('Step completed, refetching progress...');
    await refetchProgress();
    await queryClient.invalidateQueries({ queryKey: ['checklist-progress'] });
    
    if (checklistProgress && !checklistProgress.completed_at) {
      let completedSteps = 0;
      if (checklistProgress.password_updated) completedSteps++;
      if (checklistProgress.selected_sites?.length > 0) completedSteps++;
      if (checklistProgress.removal_urls?.length > 0) completedSteps++;
      if (checklistProgress.address && checklistProgress.personal_number) completedSteps++;
      
      if (completedSteps === 4) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        toast({
          title: "Congratulations! 🎉",
          description: "You've completed all the checklist items!",
        });
      }
    }
  };

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
    const baseSteps = 4; // Password, URLs, Sites Selection, Personal Info
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

  const renderCurrentStep = () => {
    const baseSteps = 4;
    const selectedSites = checklistProgress?.selected_sites || [];
    
    // If we're on a guide step
    if (currentStep > 3 && currentStep < baseSteps + selectedSites.length) {
      const guideIndex = currentStep - 4;
      const siteId = selectedSites[guideIndex];
      const guide = getGuideForSite(siteId);
      
      if (!guide) return null;

      const isGuideCompleted = checklistProgress?.completed_guides?.includes(siteId);
      
      return (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit bg-black dark:bg-white text-white dark:text-black border-none font-medium">
              {t('step.number', { number: currentStep })}
            </Badge>
            <GuideCard
              guide={guide}
              accordionId={`guide-${siteId}`}
              openAccordion={`guide-${siteId}`}
              onAccordionChange={() => {}}
            />
            <Button
              onClick={() => handleGuideComplete(siteId)}
              disabled={isGuideCompleted}
              className="w-full xl:w-1/4 lg:w-1/2"
            >
              {isGuideCompleted ? 
                (language === 'sv' ? 'Klart' : 'Completed') : 
                (language === 'sv' ? 'Markera som klar' : 'Mark as completed')}
            </Button>
          </div>
        </div>
      );
    }

    // Adjust the step number for the identification step
    const finalStepNumber = currentStep > 3 ? 4 : currentStep;
    const currentItem = checklistItems?.[finalStepNumber - 1];
    if (!currentItem) return null;

    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="w-fit bg-black dark:bg-white text-white dark:text-black border-none font-medium">
            {t('step.number', { number: currentStep })}
          </Badge>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">
              {finalStepNumber === 1 ? t('step.1.title') : 
               finalStepNumber === 2 ? t('step.2.title') : 
               finalStepNumber === 3 ? t('step.3.title') : 
               t('step.4.title')}
            </h3>
            <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              {finalStepNumber === 1 ? t('set.password.description') :
               finalStepNumber === 2 ? t('step.2.description') :
               finalStepNumber === 3 ? t('step.3.description') :
               t('step.4.description')}
            </p>
          </div>
        </div>
        <div className="pt-4">
          {(() => {
            switch (finalStepNumber) {
              case 1:
                return <PasswordUpdateForm 
                  onComplete={() => {
                    handleStepComplete();
                    setCurrentStep(2);
                  }}
                  buttonClassName="w-full xl:w-1/4 lg:w-1/2"
                />;
              case 2:
                return <UrlSubmission onComplete={() => {
                  handleStepComplete();
                  setCurrentStep(3);
                }} />;
              case 3:
                return <HidingSitesSelection onComplete={() => {
                  handleStepComplete();
                  setCurrentStep(4);
                }} />;
              case 4:
                return <PersonalInfoForm onComplete={handleStepComplete} />;
              default:
                return null;
            }
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderCurrentStep()}
      <div className="py-8">
        <Separator className="bg-[#e0e0e0] dark:bg-[#3a3a3b]" />
      </div>
      <div className="flex justify-between">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'en' ? 'Back' : 'Tillbaka'}
          </Button>
        )}
        {currentStep === 1 && <div />}
        <Button
          onClick={() => setCurrentStep((prev) => Math.min(getTotalSteps(), prev + 1))}
          disabled={currentStep === getTotalSteps()}
          className="gap-2"
        >
          {language === 'en' ? `Step ${currentStep + 1}` : `Steg ${currentStep + 1}`}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
