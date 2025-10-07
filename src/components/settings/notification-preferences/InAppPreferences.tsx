
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";

export const InAppPreferences = () => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <label className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
          {t('settings.inapp.notifications')}
        </label>
        <p className="text-[0.9rem] text-[#121212] dark:text-[#FFFFFF]">
          {t('settings.inapp.notifications.description')}
        </p>
      </div>
      <Switch
        checked={true}
        disabled={true}
        className="data-[state=checked]:bg-[#007ee5] cursor-not-allowed"
      />
    </div>
  );
};
