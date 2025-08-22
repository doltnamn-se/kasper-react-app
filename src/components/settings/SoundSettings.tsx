import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          Sound Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Sound */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="sound-enabled">Enable notification sounds</Label>
            <p className="text-sm text-muted-foreground">
              Play a sound when you receive new chat messages
            </p>
          </div>
          <Switch
            id="sound-enabled"
            checked={soundEnabled}
            onCheckedChange={handleSoundToggle}
          />
        </div>

        {/* Volume Control */}
        {soundEnabled && (
          <div className="space-y-3">
            <Label>Notification Volume</Label>
            <div className="flex items-center space-x-3">
              <VolumeX className="w-4 h-4" />
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                min={0}
                step={0.1}
                className="flex-1"
              />
              <Volume2 className="w-4 h-4" />
            </div>
            <p className="text-xs text-muted-foreground">
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
          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            Sound notifications are disabled. Enable them to hear when new messages arrive.
          </p>
        )}
      </CardContent>
    </Card>
  );
};