import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { EmailSubPreference } from "./EmailSubPreference";

interface EmailPreferencesProps {
  emailNotifications: boolean;
  emailMonitoring: boolean;
  emailDeindexing: boolean;
  emailAddressAlerts: boolean;
  emailNews: boolean;
  onMainToggle: (checked: boolean) => void;
  onSubPreferenceChange: (type: string, checked: boolean) => void;
}

export const EmailPreferences = ({
  emailNotifications,
  emailMonitoring,
  emailDeindexing,
  emailAddressAlerts,
  emailNews,
  onMainToggle,
  onSubPreferenceChange,
}: EmailPreferencesProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm text-[#000000] dark:text-[#FFFFFF]">
            {t('settings.email.notifications')}
          </label>
          <p className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('settings.email.notifications.description')}
          </p>
        </div>
        <Switch
          checked={emailNotifications}
          onCheckedChange={onMainToggle}
        />
      </div>

      {emailNotifications && (
        <div className="ml-4 space-y-4 border-l-2 border-gray-200 pl-4">
          <EmailSubPreference
            translationKey="settings.email.monitoring"
            checked={emailMonitoring}
            onCheckedChange={(checked) => onSubPreferenceChange('monitoring', checked)}
          />
          <EmailSubPreference
            translationKey="settings.email.deindexing"
            checked={emailDeindexing}
            onCheckedChange={(checked) => onSubPreferenceChange('deindexing', checked)}
          />
          <EmailSubPreference
            translationKey="settings.email.address.alerts"
            checked={emailAddressAlerts}
            onCheckedChange={(checked) => onSubPreferenceChange('addressAlerts', checked)}
          />
          <EmailSubPreference
            translationKey="settings.email.news"
            checked={emailNews}
            onCheckedChange={(checked) => onSubPreferenceChange('news', checked)}
          />
        </div>
      )}
    </div>
  );
};