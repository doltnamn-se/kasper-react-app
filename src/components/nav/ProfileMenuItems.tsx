import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserCircle, CreditCard, Settings, LogOut } from "lucide-react";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ProfileMenuItemsProps {
  onSignOut: () => void;
  isSigningOut: boolean;
}

export const ProfileMenuItems = ({ onSignOut, isSigningOut }: ProfileMenuItemsProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem 
          onClick={() => navigate("/profile")} 
          className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d]"
        >
          <UserCircle className="mr-3 h-4 w-4" />
          <span className="text-black dark:text-gray-300 font-medium">{t('profile.manage')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d]"
          onClick={() => window.open('https://billing.stripe.com/p/login/eVa4ifayTfS48la7ss', '_blank')}
        >
          <CreditCard className="mr-3 h-4 w-4" />
          <span className="text-black dark:text-gray-300 font-medium">{t('profile.billing')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate("/settings")} 
          className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d]"
        >
          <Settings className="mr-3 h-4 w-4" />
          <span className="text-black dark:text-gray-300 font-medium">{t('profile.settings')}</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator className="mx-[-8px] my-2 dark:bg-[#2d2d2d] hover:bg-transparent" />
      <DropdownMenuItem 
        onClick={onSignOut} 
        disabled={isSigningOut}
        className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d]"
      >
        <LogOut className="mr-3 h-4 w-4" />
        <span className="text-black dark:text-gray-300 font-medium">
          {isSigningOut ? t('profile.signing.out') : t('profile.sign.out')}
        </span>
      </DropdownMenuItem>
    </>
  );
};