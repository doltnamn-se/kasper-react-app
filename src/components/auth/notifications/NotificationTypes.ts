
export interface NotificationProps {
  isDarkMode?: boolean;
}

export interface NotificationMessage {
  title: string;
  body: string;
  time: string;
  id: string | number;
  heading: string;
}
