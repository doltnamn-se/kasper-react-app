
import { Language } from "@/contexts/LanguageContext";

export interface NotificationProps {
  isDarkMode?: boolean;
}

export interface NotificationMessage {
  title: string;
  body: string;
  time: string;
  id: number;
  heading: string;
}

export interface NotificationBadgeProps {
  showGooglePlayBadge: boolean;
  showAppleStoreBadge: boolean;
  isDarkMode: boolean;
  googlePlayStoreURL: string;
}

export interface NotificationCardProps {
  currentNotification: NotificationMessage;
  isDarkMode: boolean;
  isChangingText: boolean;
  notificationHeight: number | null;
  contentRef: React.RefObject<HTMLDivElement>;
  showNotification: boolean;
}

export interface TypingAnimationProps {
  fullText: string;
  showTitle: boolean;
  isDarkMode: boolean;
  displayText: string;
  isTypingComplete: boolean;
}
