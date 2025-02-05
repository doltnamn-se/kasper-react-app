import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { Translations } from "@/translations/types";

interface EmailSubPreferenceProps {
  translationKey: keyof Translations;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const EmailSubPreference = ({
  translationKey,
  checked,
  onCheckedChange,
}: EmailSubPreferenceProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-[#000000] dark:text-[#FFFFFF]">
        {t(translationKey)}
      </label>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-[#000000A6] dark:data-[state=checked]:bg-[#c3caf5]"
      />
    </div>
  );
};