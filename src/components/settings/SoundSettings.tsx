import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX } from 'lucide-react';
import { 
  isSoundEnabled, 
  setSoundEnabled, 
  testNotificationSound, 
  setNotificationVolume 
} from '@/utils/notificationSound';

export const SoundSettings: React.FC = () => {
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
          Sound Notifications
        </h2>
      </div>
      <div className="space-y-6">
        {/* Enable/Disable Sound */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="sound-enabled" className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              Enable notification sounds
            </Label>
            <p className="text-[0.9rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              Play a sound when you receive new chat messages
            </p>
          </div>
          <Switch
            id="sound-enabled"
            checked={soundEnabled}
            onCheckedChange={handleSoundToggle}
            className="data-[state=checked]:bg-[#007ee5]"
          />
        </div>

        {/* Volume Control */}
        {soundEnabled && (
          <div className="space-y-3">
            <Label className="text-[0.8rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              Notification Volume
            </Label>
            <div className="flex items-center space-x-3">
              <VolumeX className="w-4 h-4" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                min={0}
                step={0.1}
                className="flex-1 [&_[role=slider]]:border-[#007ee5] [&_.bg-primary]:bg-[#007ee5]"
              />
              <Volume2 className="w-4 h-4" />
            </div>
            <p className="text-[0.9rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              {Math.round(volume * 100)}% volume
            </p>
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
              Test Notification Sound
            </Button>
          </div>
        )}

        {!soundEnabled && (
          <p className="text-[0.9rem] font-medium text-[#000000A6] dark:text-[#FFFFFFA6] bg-muted p-3 rounded-md">
            Sound notifications are disabled. Enable them to hear when new messages arrive.
          </p>
        )}
      </div>
    </div>
  );
};