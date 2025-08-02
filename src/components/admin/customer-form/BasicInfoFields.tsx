
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubscriptionPlan } from "@/types/customer-form";
import { useLanguage } from "@/contexts/LanguageContext";

interface BasicInfoFieldsProps {
  email: string;
  displayName: string;
  subscriptionPlan: SubscriptionPlan;
  onEmailChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onSubscriptionPlanChange: (value: SubscriptionPlan) => void;
}

export const BasicInfoFields = ({
  email,
  displayName,
  subscriptionPlan,
  onEmailChange,
  onDisplayNameChange,
  onSubscriptionPlanChange,
}: BasicInfoFieldsProps) => {
  const { t } = useLanguage();
  
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="displayName">{t('display.name')}</Label>
        <Input
          id="displayName"
          placeholder="John Doe"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          placeholder="customer@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subscriptionPlan">{t('subscription')}</Label>
        <Select
          value={subscriptionPlan}
          onValueChange={onSubscriptionPlanChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('select.subscription.plan')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1_month">{t('1.month')}</SelectItem>
            <SelectItem value="3_months">{t('3.months')}</SelectItem>
            <SelectItem value="6_months">{t('6.months')}</SelectItem>
            <SelectItem value="12_months">{t('12.months')}</SelectItem>
            <SelectItem value="24_months">{t('24.months')}</SelectItem>
            <SelectItem value="personskydd_1_year">Personskydd - 1 år</SelectItem>
            <SelectItem value="parskydd_1_year">Parskydd - 1 år</SelectItem>
            <SelectItem value="familjeskydd_1_year">Familjeskydd - 1 år</SelectItem>
            <SelectItem value="personskydd_2_years">Personskydd - 2 år</SelectItem>
            <SelectItem value="parskydd_2_years">Parskydd - 2 år</SelectItem>
            <SelectItem value="familjeskydd_2_years">Familjeskydd - 2 år</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
