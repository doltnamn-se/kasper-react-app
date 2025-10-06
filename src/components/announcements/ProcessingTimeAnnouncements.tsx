import { useState, useEffect } from "react";
import { Info, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Preferences } from '@capacitor/preferences';

export const ProcessingTimeAnnouncements = () => {
  const { language } = useLanguage();
  const [showMrKoll, setShowMrKoll] = useState(true);
  const [showGoogle, setShowGoogle] = useState(true);

  // Load the dismissed state from storage on mount
  useEffect(() => {
    const loadDismissedState = async () => {
      const { value: mrKollDismissed } = await Preferences.get({ key: 'announcement_mrkoll_dismissed' });
      const { value: googleDismissed } = await Preferences.get({ key: 'announcement_google_dismissed' });
      
      if (mrKollDismissed === 'true') {
        setShowMrKoll(false);
      }
      if (googleDismissed === 'true') {
        setShowGoogle(false);
      }
    };
    
    loadDismissedState();
  }, []);

  const handleDismissMrKoll = async () => {
    setShowMrKoll(false);
    await Preferences.set({ key: 'announcement_mrkoll_dismissed', value: 'true' });
  };

  const handleDismissGoogle = async () => {
    setShowGoogle(false);
    await Preferences.set({ key: 'announcement_google_dismissed', value: 'true' });
  };

  const mrKollText = language === 'sv'
    ? "Just nu är MrKolls handläggningstid för borttagning av profiler mellan 3-5 veckor"
    : "Right now, MrKoll's processing time for removing profiles is between 3-5 weeks";

  const googleText = language === 'sv'
    ? "Just nu är Googles handläggningstid för borttagning av länkar mellan 6-12 veckor"
    : "Right now, Google's processing time for link removal is between 6-12 weeks";

  // If both are hidden, don't render anything
  if (!showMrKoll && !showGoogle) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {showMrKoll && (
        <div className="relative p-4 md:p-6 rounded-2xl border bg-[hsl(var(--id-info-bg))] dark:bg-[hsl(var(--id-info-bg))] border-[hsl(var(--id-info-border))] dark:border-[hsl(var(--id-info-border))]">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-[hsl(var(--id-info-text))]/10"
            onClick={handleDismissMrKoll}
          >
            <X className="h-4 w-4 text-[hsl(var(--id-info-text))]" />
          </Button>
          <div className="flex items-start gap-2 pr-8">
            <Info className="h-5 w-5 mt-0.5 shrink-0 [&>circle]:fill-[hsl(var(--id-info-icon-fill))] [&>circle]:stroke-[hsl(var(--id-info-icon-fill))] [&>path]:stroke-[hsl(var(--id-info-icon-i))]" />
            <p className="text-sm text-[hsl(var(--id-info-text))]">{mrKollText}</p>
          </div>
        </div>
      )}

      {showGoogle && (
        <div className="relative p-4 md:p-6 rounded-2xl border bg-[hsl(var(--id-info-bg))] dark:bg-[hsl(var(--id-info-bg))] border-[hsl(var(--id-info-border))] dark:border-[hsl(var(--id-info-border))]">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-[hsl(var(--id-info-text))]/10"
            onClick={handleDismissGoogle}
          >
            <X className="h-4 w-4 text-[hsl(var(--id-info-text))]" />
          </Button>
          <div className="flex items-start gap-2 pr-8">
            <Info className="h-5 w-5 mt-0.5 shrink-0 [&>circle]:fill-[hsl(var(--id-info-icon-fill))] [&>circle]:stroke-[hsl(var(--id-info-icon-fill))] [&>path]:stroke-[hsl(var(--id-info-icon-i))]" />
            <p className="text-sm text-[hsl(var(--id-info-text))]">{googleText}</p>
          </div>
        </div>
      )}
    </div>
  );
};
