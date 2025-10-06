import { useState, useEffect } from "react";
import { Info, X, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Preferences } from '@capacitor/preferences';

export const ProcessingTimeAnnouncements = () => {
  const { language } = useLanguage();
  const [isMrKollExpanded, setIsMrKollExpanded] = useState(true);
  const [isGoogleExpanded, setIsGoogleExpanded] = useState(true);

  // Load the collapsed state from storage on mount
  useEffect(() => {
    const loadCollapsedState = async () => {
      const { value: mrKollCollapsed } = await Preferences.get({ key: 'announcement_mrkoll_collapsed' });
      const { value: googleCollapsed } = await Preferences.get({ key: 'announcement_google_collapsed' });
      
      if (mrKollCollapsed === 'true') {
        setIsMrKollExpanded(false);
      }
      if (googleCollapsed === 'true') {
        setIsGoogleExpanded(false);
      }
    };
    
    loadCollapsedState();
  }, []);

  const handleToggleMrKoll = async () => {
    const newState = !isMrKollExpanded;
    setIsMrKollExpanded(newState);
    await Preferences.set({ key: 'announcement_mrkoll_collapsed', value: String(!newState) });
  };

  const handleToggleGoogle = async () => {
    const newState = !isGoogleExpanded;
    setIsGoogleExpanded(newState);
    await Preferences.set({ key: 'announcement_google_collapsed', value: String(!newState) });
  };

  const mrKollText = language === 'sv'
    ? "Just nu är MrKolls handläggningstid för borttagning av profiler mellan 3-5 veckor"
    : "Right now, MrKoll's processing time for removing profiles is between 3-5 weeks";

  const googleText = language === 'sv'
    ? "Just nu är Googles handläggningstid för borttagning av länkar mellan 6-12 veckor"
    : "Right now, Google's processing time for link removal is between 6-12 weeks";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className={`relative rounded-2xl border bg-[hsl(var(--id-info-bg))] dark:bg-[hsl(var(--id-info-bg))] border-[hsl(var(--id-info-border))] dark:border-[hsl(var(--id-info-border))] transition-all duration-300 ${isMrKollExpanded ? 'p-4 md:p-6' : 'p-3'}`}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-[hsl(var(--id-info-text))]/10"
          onClick={handleToggleMrKoll}
        >
          {isMrKollExpanded ? (
            <X className="h-4 w-4 text-[hsl(var(--id-info-text))]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[hsl(var(--id-info-text))]" />
          )}
        </Button>
        <div className="flex items-start gap-2 pr-8">
          <Info className="h-5 w-5 mt-0.5 shrink-0 [&>circle]:fill-[hsl(var(--id-info-icon-fill))] [&>circle]:stroke-[hsl(var(--id-info-icon-fill))] [&>path]:stroke-[hsl(var(--id-info-icon-i))]" />
          {isMrKollExpanded && (
            <p className="text-sm text-[hsl(var(--id-info-text))] animate-fade-in">{mrKollText}</p>
          )}
        </div>
      </div>

      <div className={`relative rounded-2xl border bg-[hsl(var(--id-info-bg))] dark:bg-[hsl(var(--id-info-bg))] border-[hsl(var(--id-info-border))] dark:border-[hsl(var(--id-info-border))] transition-all duration-300 ${isGoogleExpanded ? 'p-4 md:p-6' : 'p-3'}`}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-[hsl(var(--id-info-text))]/10"
          onClick={handleToggleGoogle}
        >
          {isGoogleExpanded ? (
            <X className="h-4 w-4 text-[hsl(var(--id-info-text))]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[hsl(var(--id-info-text))]" />
          )}
        </Button>
        <div className="flex items-start gap-2 pr-8">
          <Info className="h-5 w-5 mt-0.5 shrink-0 [&>circle]:fill-[hsl(var(--id-info-icon-fill))] [&>circle]:stroke-[hsl(var(--id-info-icon-fill))] [&>path]:stroke-[hsl(var(--id-info-icon-i))]" />
          {isGoogleExpanded && (
            <p className="text-sm text-[hsl(var(--id-info-text))] animate-fade-in">{googleText}</p>
          )}
        </div>
      </div>
    </div>
  );
};
