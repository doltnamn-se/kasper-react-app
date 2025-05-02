
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CustomerType } from "@/types/customer-form";
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomerTypeFieldProps {
  value: CustomerType;
  onChange: (value: CustomerType) => void;
}

export const CustomerTypeField = ({ value, onChange }: CustomerTypeFieldProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="customerType">{t('customer.type')}</Label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('select.customer.type')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="private">{t('private.customer')}</SelectItem>
          <SelectItem value="business">{t('business.client')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
