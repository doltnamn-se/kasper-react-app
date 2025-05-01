
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

interface SubscriptionPlanSelectProps {
  currentPlan: string | null;
  isUpdating: boolean;
  onUpdatePlan: (plan: string) => void;
}

export const SubscriptionPlanSelect = ({ 
  currentPlan, 
  isUpdating, 
  onUpdatePlan 
}: SubscriptionPlanSelectProps) => {
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlan || 'none');
  
  // Update local state when props change (e.g., after refetch)
  useEffect(() => {
    setSelectedPlan(currentPlan || 'none');
  }, [currentPlan]);

  const handlePlanChange = (value: string) => {
    // Update local state immediately for visual feedback
    setSelectedPlan(value);
    // Trigger the update
    onUpdatePlan(value);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <Select
          value={selectedPlan}
          onValueChange={handlePlanChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t('subscription.select')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('subscription.none')}</SelectItem>
            <SelectItem value="1_month">{t('subscription.1month')}</SelectItem>
            <SelectItem value="3_months">{t('subscription.3months')}</SelectItem>
            <SelectItem value="6_months">{t('subscription.6months')}</SelectItem>
            <SelectItem value="12_months">{t('subscription.12months')}</SelectItem>
            <SelectItem value="24_months">{t('subscription.24months')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
