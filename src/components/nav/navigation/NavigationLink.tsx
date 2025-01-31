import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface NavigationLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  unreadCount?: number;
  onClick?: () => void;
}

export const NavigationLink = ({ 
  to, 
  icon: Icon, 
  label, 
  isActive, 
  unreadCount = 0,
  onClick 
}: NavigationLinkProps) => {
  const hasNotification = unreadCount > 0;

  return (
    <Link 
      to={to} 
      className={`flex items-center justify-between gap-3 mb-3 py-2.5 px-3 rounded-md ${
        isActive 
          ? "bg-gray-100 dark:bg-[#2d2d2d]" 
          : "hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <span className="text-black dark:text-white">
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <span className="text-sm text-[#000000] dark:text-white font-medium">{label}</span>
      </div>
      {hasNotification && (
        <div className="h-2 w-2 rounded-full bg-[#2e77d0]" />
      )}
    </Link>
  );
};