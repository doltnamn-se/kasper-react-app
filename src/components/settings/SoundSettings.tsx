import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  isSoundEnabled, 
  setSoundEnabled, 
  testNotificationSound, 
  setNotificationVolume 
} from '@/utils/notificationSound';

export const SoundSettings: React.FC = () => {
  const { t } = useLanguage();
  const [soundEnabled, setSoundEnabledState] = React.useState(isSoundEnabled());
  const [volume, setVolume] = React.useState(0.5);

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    setSoundEnabledState(enabled);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setNotificationVolume(newVolume);
  };

  const handleTestSound = () => {
    testNotificationSound();
  };

  return (
    <div>
      <div>
        <h2 className="mb-6">
          {t('settings.sound.notifications')}
        </h2>
      </div>
      <div className="space-y-6">
        {/* Enable/Disable Sound */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="sound-enabled" className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              {t('settings.sound.enable')}
            </Label>
            <p className="text-[0.9rem] font-medium text-[#121212] dark:text-[#FFFFFF]">
              {t('settings.sound.enable.description')}
            </p>
          </div>
          <Switch
            id="sound-enabled"
            checked={soundEnabled}
            onCheckedChange={handleSoundToggle}
            className="data-[state=checked]:bg-[#121212] dark:data-[state=checked]:bg-[#FFFFFF] [&_span[data-state=checked]]:bg-white dark:[&_span[data-state=checked]]:bg-[#1c1c1e]"
          />
        </div>

        {/* Volume Control */}
        {soundEnabled && (
          <div className="space-y-3">
            <Label className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              {t('settings.sound.volume')}
            </Label>
            <div className="flex items-center space-x-3">
              <VolumeX className="w-4 h-4" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                min={0}
                step={0.1}
                className="flex-1 [&_[role=slider]]:border-[#121212] dark:[&_[role=slider]]:border-[#FFFFFF] dark:[&_[role=slider]]:bg-[#1c1c1e] [&_.bg-primary]:bg-[#121212] dark:[&_.bg-primary]:bg-[#FFFFFF]"
              />
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Test Sound Button */}
        {soundEnabled && (
          <div className="pt-3">
            <Button 
              variant="outline" 
              onClick={handleTestSound}
              className="w-full"
            >
              {t('settings.sound.test')}
            </Button>
          </div>
        )}

        {!soundEnabled && (
          <p className="text-[0.9rem] font-medium text-[#121212] dark:text-[#FFFFFF] bg-muted p-3 rounded-md">
            {t('settings.sound.disabled')}
          </p>
        )}
      </div>
    </div>
  );
};