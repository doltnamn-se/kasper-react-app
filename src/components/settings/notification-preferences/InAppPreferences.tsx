import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";

export const InAppPreferences = () => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <label className="text-sm text-[#000000] dark:text-[#FFFFFF]">
          {t('settings.inapp.notifications')}
        </label>
        <p className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6]">
          {t('settings.inapp.notifications.description')}
        </p>
      </div>
      <Switch
        checked={true}
        disabled={true}
        className="cursor-not-allowed data-[state=checked]:bg-[#000000] dark:data-[state=checked]:bg-[#FFFFFF] [&>span]:dark:bg-[#1c1c1e] [&>span]:dark:data-[state=checked]:bg-[#1c1c1e]"
      />
    </div>
  );
};