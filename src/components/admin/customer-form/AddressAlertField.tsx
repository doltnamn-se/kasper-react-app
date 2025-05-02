
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddressAlertFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const AddressAlertField = ({ value, onChange }: AddressAlertFieldProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="hasAddressAlert">{t('address.alert')}</Label>
      <Select
        value={value ? "yes" : "no"}
        onValueChange={(value) => onChange(value === "yes")}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('select.address.alert')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="yes">{t('success')}</SelectItem>
          <SelectItem value="no">{t('cancel')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
