
import { useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const [hasChanged, setHasChanged] = useState(false);
  
  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
    setHasChanged(value !== currentPlan);
  };

  const handleUpdateClick = () => {
    onUpdatePlan(selectedPlan);
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
        
        {hasChanged && (
          <Button 
            onClick={handleUpdateClick}
            disabled={isUpdating}
            size="sm"
          >
            {isUpdating ? t('updating') : t('update')}
          </Button>
        )}
      </div>
    </div>
  );
};
