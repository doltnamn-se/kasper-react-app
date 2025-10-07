
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmailPreferencesProps {
  emailNotifications: boolean;
  onMainToggle: (checked: boolean) => void;
}

export const EmailPreferences = ({
  emailNotifications,
  onMainToggle,
}: EmailPreferencesProps) => {
  const { t } = useLanguage();

  console.log('Email Preferences State:', {
    emailNotifications,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('settings.email.notifications')}
          </label>
          <p className="text-[0.9rem] text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('settings.email.notifications.description')}
          </p>
        </div>
        <Switch
          checked={emailNotifications}
          onCheckedChange={onMainToggle}
          aria-label="Toggle email notifications"
          className="data-[state=checked]:bg-[#007ee5]"
        />
      </div>
    </div>
  );
};
