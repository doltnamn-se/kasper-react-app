import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { GuideCard } from "@/components/guides/GuideCard";
import { Button } from "@/components/ui/button";
import { PasswordUpdateForm } from "./PasswordUpdateForm";
import { UrlSubmission } from "./UrlSubmission";
import { HidingSitesSelection } from "./HidingSitesSelection";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { ChecklistAddressForm } from "./ChecklistAddressForm";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StepGuide } from "./StepGuide";

interface StepContentProps {
  currentStep: number;
  selectedSites: string[];
  completedGuides: string[] | null;
  onGuideComplete: (siteId: string) => Promise<void>;
  onStepComplete: () => Promise<void>;
  checklistItems: any[];
  getGuideForSite: (siteId: string) => any;
}

export const StepContent = ({
  currentStep,
  selectedSites,
  completedGuides,
  onGuideComplete,
  onStepComplete,
  checklistItems,
  getGuideForSite
}: StepContentProps) => {
  const { t, language } = useLanguage();
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());

  const { data: customerData } = useQuery({
    queryKey: ['customer-data'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

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

  // Calculate the actual step number for the final step
  const baseSteps = 3;
  const finalStepNumber = currentStep > baseSteps ? 
    (currentStep <= baseSteps + selectedSites.length ? currentStep : baseSteps + selectedSites.length + 1) : 
    currentStep;

  const currentItem = checklistItems?.[finalStepNumber - 1];
  if (!currentItem) return null;

  // For guide steps (after step 3)
  if (currentStep > 3 && currentStep <= baseSteps + selectedSites.length) {
    const siteIndex = currentStep - 4;
    const siteId = selectedSites[siteIndex];
    const guide = getGuideForSite(siteId);
    const isGuideCompleted = completedGuides?.includes(siteId);

    return (
      <StepGuide
        currentStep={currentStep}
        siteId={siteId}
        guide={guide}
        isGuideCompleted={Boolean(isGuideCompleted)}
        onGuideComplete={onGuideComplete}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Badge variant="outline" className="w-fit bg-black dark:bg-white text-white dark:text-black border-none font-medium">
        {t('step.number', { number: currentStep })}
      </Badge>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">
          {finalStepNumber === 1 ? t('step.1.title') : 
           finalStepNumber === 2 ? t('step.2.title') : 
           finalStepNumber === 3 ? t('step.3.title') : 
           customerData?.has_address_alert ? t('step.4.title') :
           t('step.identification.title')}
        </h3>
        <p className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
          {finalStepNumber === 1 ? t('set.password.description') :
           finalStepNumber === 2 ? t('step.2.description') :
           finalStepNumber === 3 ? t('step.3.description') :
           customerData?.has_address_alert ? t('step.4.description') :
           t('step.identification.description')}
        </p>
      </div>
      <div className="pt-4">
        {(() => {
          switch (finalStepNumber) {
            case 1:
              return <PasswordUpdateForm 
                onComplete={onStepComplete}
                buttonClassName="w-full xl:w-1/4 lg:w-1/2"
              />;
            case 2:
              return <UrlSubmission onComplete={onStepComplete} />;
            case 3:
              return <HidingSitesSelection onComplete={onStepComplete} />;
            default:
              if (customerData?.has_address_alert) {
                return (
                  <div className="space-y-4">
                    <ChecklistAddressForm onSuccess={onStepComplete} />
                  </div>
                );
              }
              return <PersonalInfoForm onComplete={onStepComplete} />;
          }
        })()}
      </div>
    </div>
  );
};