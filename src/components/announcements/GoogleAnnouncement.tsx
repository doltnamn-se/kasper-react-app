import { useState, useEffect, useRef } from "react";
import { Info, X, ChevronDown, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Preferences } from '@capacitor/preferences';
import { useIsMobile } from "@/hooks/use-mobile";

export const GoogleAnnouncement = () => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(true);
  const [show, setShow] = useState(true);
  
  // Swipe states
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  const startX = useRef(0);

  // Load the collapsed and deleted state from storage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const { value: collapsed } = await Preferences.get({ key: 'announcement_google_collapsed' });
        const { value: deleted } = await Preferences.get({ key: 'announcement_google_deleted' });
        
        console.log('[Google] Loaded from Preferences - collapsed:', collapsed, 'deleted:', deleted);
        
        if (collapsed === 'true') {
          setIsExpanded(false);
        }
        if (deleted === 'true') {
          setShow(false);
        }
      } catch (error) {
        console.error('[Google] Error loading preferences:', error);
      }
    };
    
    loadState();
  }, []);

  const handleToggle = async () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    try {
      await Preferences.set({ key: 'announcement_google_collapsed', value: String(!newState) });
      console.log('[Google] Saved collapsed state:', String(!newState));
    } catch (error) {
      console.error('[Google] Error saving collapsed state:', error);
    }
  };

  const handleDelete = async () => {
    setShow(false);
    try {
      await Preferences.set({ key: 'announcement_google_deleted', value: 'true' });
      console.log('[Google] Saved deleted state: true');
    } catch (error) {
      console.error('[Google] Error saving deleted state:', error);
    }
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    startX.current = e.touches[0].clientX - swipeX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    setSwipeX(Math.max(Math.min(diff, 0), -80));
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    setIsSwiping(false);
    if (swipeX < -40) {
      setSwipeX(-80);
    } else {
      setSwipeX(0);
    }
  };

  const text = language === 'sv'
    ? "Just nu är Googles handläggningstid för borttagning av länkar mellan 6-12 veckor"
    : "Right now, Google's processing time for link removal is between 6-12 weeks";

  if (!show) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Trash bin background - revealed on swipe */}
      <div className="absolute inset-0 bg-red-500 dark:bg-red-600 rounded-2xl flex items-center justify-end pr-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={handleDelete}
        >
          <Trash2 className="h-5 w-5 text-white" />
        </Button>
      </div>
      
      {/* Main content - swipeable */}
      <div 
        className={`relative rounded-2xl border bg-[hsl(var(--id-info-bg))] dark:bg-[hsl(var(--id-info-bg))] border-[hsl(var(--id-info-border))] dark:border-[hsl(var(--id-info-border))] transition-all duration-300 ${isExpanded ? 'p-4 md:p-6' : 'p-3'}`}
        style={{
          transform: `translate3d(${swipeX}px, 0, 0)`,
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: isSwiping ? 'transform' : 'auto',
          touchAction: 'pan-y'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-[hsl(var(--id-info-text))]/10"
          onClick={handleToggle}
        >
          {isExpanded ? (
            <X className="h-4 w-4 text-[hsl(var(--id-info-text))]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[hsl(var(--id-info-text))]" />
          )}
        </Button>
        <div className="flex items-start gap-2 pr-8">
          <Info className="h-5 w-5 mt-0.5 shrink-0 [&>circle]:fill-[hsl(var(--id-info-icon-fill))] [&>circle]:stroke-[hsl(var(--id-info-icon-fill))] [&>path]:stroke-[hsl(var(--id-info-icon-i))]" />
          {isExpanded && (
            <p className="text-sm text-[hsl(var(--id-info-text))] animate-fade-in">{text}</p>
          )}
        </div>
      </div>
    </div>
  );
};
