
import { ListChecks } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerWithProfile } from "@/types/customer";
import { useMemo } from "react";

interface ChecklistProgressProps {
  customer: CustomerWithProfile;
}

export const ChecklistProgress = ({ customer }: ChecklistProgressProps) => {
  const { t } = useLanguage();
  
  // Calculate progress based on onboarding steps
  const { progressPercentage, completedSteps, totalSteps } = useMemo(() => {
    const totalSteps = 5; // Example: total onboarding steps
    const completedSteps = customer.onboarding_completed ? 
      totalSteps : (customer.onboarding_step || 0);
    const progressPercentage = customer.onboarding_completed ? 
      100 : Math.round((completedSteps / totalSteps) * 100);
    
    return { progressPercentage, completedSteps, totalSteps };
  }, [customer]);

  return (
    <div>
      <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6] mb-3 flex items-center gap-2">
        <ListChecks className="w-4 h-4" />
        {t('checklist')}
      </h3>
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">{t('status')}</p>
          <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
            {progressPercentage === 100 ? t('completed') : t('in.progress')}
          </p>
        </div>
        
        {progressPercentage !== 100 && (
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">{t('progress')}</p>
            <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
              {completedSteps} / {totalSteps} {t('steps')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
