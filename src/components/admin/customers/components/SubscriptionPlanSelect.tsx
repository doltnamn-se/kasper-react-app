
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  
  const handlePlanChange = (value: string) => {
    // Immediately trigger update when plan changes
    onUpdatePlan(value);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <Select
          value={currentPlan || 'none'}
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
