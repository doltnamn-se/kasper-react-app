
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
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'sv' : 'en';
    setLanguage(newLanguage);
  };

  const languages = {
    sv: { flag: '🇸🇪', label: 'Svenska' },
    en: { flag: '🇬🇧', label: 'English' }
  };

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem 
          onClick={() => navigate("/settings", { state: { defaultTab: "profile" } })} 
          className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] data-[highlighted=true]:bg-[#f3f4f6] dark:data-[highlighted=true]:bg-[#2d2d2d]"
        >
          <UserCircle className="mr-3 h-4 w-4" />
          <span className="text-black dark:text-gray-300 font-medium">{t('profile.manage')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] data-[highlighted=true]:bg-[#f3f4f6] dark:data-[highlighted=true]:bg-[#2d2d2d]"
          onClick={() => window.location.href = 'https://billing.stripe.com/p/login/eVa4ifayTfS48la7ss'}
        >
          <CreditCard className="mr-3 h-4 w-4" />
          <span className="text-black dark:text-gray-300 font-medium">{t('profile.billing')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate("/settings")} 
          className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] data-[highlighted=true]:bg-[#f3f4f6] dark:data-[highlighted=true]:bg-[#2d2d2d]"
        >
          <Settings className="mr-3 h-4 w-4" />
          <span className="text-black dark:text-gray-300 font-medium">{t('profile.settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="mx-[-8px] my-2 dark:bg-[#2d2d2d]" />
        <DropdownMenuItem 
          onClick={toggleLanguage} 
          className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] data-[highlighted=true]:bg-[#f3f4f6] dark:data-[highlighted=true]:bg-[#2d2d2d]"
        >
          <span className="mr-3 h-4 w-4 flex items-center justify-center">
            {languages[language === 'en' ? 'sv' : 'en'].flag}
          </span>
          <span className="text-black dark:text-gray-300 font-medium">
            {language === 'en' ? 'Svenska' : 'English'}
          </span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator className="mx-[-8px] my-2 dark:bg-[#2d2d2d]" />
      <DropdownMenuItem 
        onClick={onSignOut} 
        disabled={isSigningOut}
        className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] data-[highlighted=true]:bg-[#f3f4f6] dark:data-[highlighted=true]:bg-[#2d2d2d]"
      >
        <LogOut className="mr-3 h-4 w-4" />
        <span className="text-black dark:text-gray-300 font-medium">
          {isSigningOut ? t('profile.signing.out') : t('profile.sign.out')}
        </span>
      </DropdownMenuItem>
    </>
  );
};
