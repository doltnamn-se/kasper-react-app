import { useState, useEffect, useRef } from "react";
import { Info, X, ChevronDown, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Preferences } from '@capacitor/preferences';
import { useIsMobile } from "@/hooks/use-mobile";

export const ProcessingTimeAnnouncements = () => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [isMrKollExpanded, setIsMrKollExpanded] = useState(true);
  const [isGoogleExpanded, setIsGoogleExpanded] = useState(true);
  const [showMrKoll, setShowMrKoll] = useState(true);
  const [showGoogle, setShowGoogle] = useState(true);
  
  // Swipe states
  const [mrKollSwipeX, setMrKollSwipeX] = useState(0);
  const [googleSwipeX, setGoogleSwipeX] = useState(0);
  const [mrKollIsSwiping, setMrKollIsSwiping] = useState(false);
  const [googleIsSwiping, setGoogleIsSwiping] = useState(false);
  
  const mrKollStartX = useRef(0);
  const googleStartX = useRef(0);

  // Load the collapsed and deleted state from storage on mount
  useEffect(() => {
    const loadState = async () => {
      const { value: mrKollCollapsed } = await Preferences.get({ key: 'announcement_mrkoll_collapsed' });
      const { value: googleCollapsed } = await Preferences.get({ key: 'announcement_google_collapsed' });
      const { value: mrKollDeleted } = await Preferences.get({ key: 'announcement_mrkoll_deleted' });
      const { value: googleDeleted } = await Preferences.get({ key: 'announcement_google_deleted' });
      
      if (mrKollCollapsed === 'true') {
        setIsMrKollExpanded(false);
      }
      if (googleCollapsed === 'true') {
        setIsGoogleExpanded(false);
      }
      if (mrKollDeleted === 'true') {
        setShowMrKoll(false);
      }
      if (googleDeleted === 'true') {
        setShowGoogle(false);
      }
    };
    
    loadState();
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

  const handleDeleteMrKoll = async () => {
    setShowMrKoll(false);
    await Preferences.set({ key: 'announcement_mrkoll_deleted', value: 'true' });
  };

  const handleDeleteGoogle = async () => {
    setShowGoogle(false);
    await Preferences.set({ key: 'announcement_google_deleted', value: 'true' });
  };

  // Swipe handlers for MrKoll
  const handleMrKollTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    mrKollStartX.current = e.touches[0].clientX;
    setMrKollIsSwiping(true);
  };

  const handleMrKollTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !mrKollIsSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - mrKollStartX.current;
    // Only allow left swipe (negative values) and limit to -80px
    if (diff < 0) {
      setMrKollSwipeX(Math.max(diff, -80));
    }
  };

  const handleMrKollTouchEnd = () => {
    if (!isMobile) return;
    setMrKollIsSwiping(false);
    // If swiped more than 40px, keep it revealed, otherwise reset
    if (mrKollSwipeX < -40) {
      setMrKollSwipeX(-80);
    } else {
      setMrKollSwipeX(0);
    }
  };

  // Swipe handlers for Google
  const handleGoogleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    googleStartX.current = e.touches[0].clientX;
    setGoogleIsSwiping(true);
  };

  const handleGoogleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !googleIsSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - googleStartX.current;
    // Only allow left swipe (negative values) and limit to -80px
    if (diff < 0) {
      setGoogleSwipeX(Math.max(diff, -80));
    }
  };

  const handleGoogleTouchEnd = () => {
    if (!isMobile) return;
    setGoogleIsSwiping(false);
    // If swiped more than 40px, keep it revealed, otherwise reset
    if (googleSwipeX < -40) {
      setGoogleSwipeX(-80);
    } else {
      setGoogleSwipeX(0);
    }
  };

  const mrKollText = language === 'sv'
    ? "Just nu är MrKolls handläggningstid för borttagning av profiler mellan 3-5 veckor"
    : "Right now, MrKoll's processing time for removing profiles is between 3-5 weeks";

  const googleText = language === 'sv'
    ? "Just nu är Googles handläggningstid för borttagning av länkar mellan 6-12 veckor"
    : "Right now, Google's processing time for link removal is between 6-12 weeks";

  if (!showMrKoll && !showGoogle) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {showMrKoll && (
        <div className="relative overflow-hidden rounded-2xl">
          {/* Trash bin background - revealed on swipe */}
          <div className="absolute inset-0 bg-red-500 dark:bg-red-600 rounded-2xl flex items-center justify-end pr-6">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={handleDeleteMrKoll}
            >
              <Trash2 className="h-5 w-5 text-white" />
            </Button>
          </div>
          
          {/* Main content - swipeable */}
          <div 
            className={`relative rounded-2xl border bg-[hsl(var(--id-info-bg))] dark:bg-[hsl(var(--id-info-bg))] border-[hsl(var(--id-info-border))] dark:border-[hsl(var(--id-info-border))] transition-all duration-300 ${isMrKollExpanded ? 'p-4 md:p-6' : 'p-3'}`}
            style={{
              transform: `translateX(${mrKollSwipeX}px)`,
              transition: mrKollIsSwiping ? 'none' : 'transform 0.3s ease-out'
            }}
            onTouchStart={handleMrKollTouchStart}
            onTouchMove={handleMrKollTouchMove}
            onTouchEnd={handleMrKollTouchEnd}
          >
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
        </div>
      )}

      {showGoogle && (
        <div className="relative overflow-hidden rounded-2xl">
          {/* Trash bin background - revealed on swipe */}
          <div className="absolute inset-0 bg-red-500 dark:bg-red-600 rounded-2xl flex items-center justify-end pr-6">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={handleDeleteGoogle}
            >
              <Trash2 className="h-5 w-5 text-white" />
            </Button>
          </div>
          
          {/* Main content - swipeable */}
          <div 
            className={`relative rounded-2xl border bg-[hsl(var(--id-info-bg))] dark:bg-[hsl(var(--id-info-bg))] border-[hsl(var(--id-info-border))] dark:border-[hsl(var(--id-info-border))] transition-all duration-300 ${isGoogleExpanded ? 'p-4 md:p-6' : 'p-3'}`}
            style={{
              transform: `translateX(${googleSwipeX}px)`,
              transition: googleIsSwiping ? 'none' : 'transform 0.3s ease-out'
            }}
            onTouchStart={handleGoogleTouchStart}
            onTouchMove={handleGoogleTouchMove}
            onTouchEnd={handleGoogleTouchEnd}
          >
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
      )}
    </div>
  );
};
