
import { ListChecks } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChecklistProgressProps {
  progressPercentage: number;
  completedSteps: number;
  totalSteps: number;
}

export const ChecklistProgress = ({ progressPercentage, completedSteps, totalSteps }: ChecklistProgressProps) => {
  const { t } = useLanguage();

  return (
    <div>
      <h3 className="text-base font-medium text-[#000000] dark:text-[#FFFFFFA6] mb-3 flex items-center gap-2">
        <ListChecks className="w-4 h-4" />
        {t('checklist')}
      </h3>
      <div className="space-y-2">
        <p className="text-xs font-medium flex justify-between">
          <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('status')}</span>
          <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
            {progressPercentage === 100 ? t('completed') : t('in.progress')}
          </span>
        </p>
        {progressPercentage !== 100 && (
          <p className="text-xs font-medium flex justify-between">
            <span className="text-[#000000] dark:text-[#FFFFFFA6]">{t('progress')}</span>
            <span className="text-[#000000A6] dark:text-[#FFFFFFA6]">
              {completedSteps} / {totalSteps} {t('steps')}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
