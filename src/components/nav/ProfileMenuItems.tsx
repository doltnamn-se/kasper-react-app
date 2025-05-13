
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserCircle, CreditCard, Settings, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useUserProfile } from "@/hooks/useUserProfile";
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
  const { setTheme, resolvedTheme } = useTheme();
  const { userProfile, userEmail } = useUserProfile();

  const languages = {
    sv: { flag: '🇸🇪', label: 'Svenska' },
    en: { flag: '🇬🇧', label: 'English' }
  };
  
  // Get the display name from userProfile or fall back to email
  const displayName = userProfile?.display_name || userEmail || t('profile.manage');

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem 
          onClick={() => navigate("/settings", { state: { defaultTab: "profile" } })} 
          className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] data-[highlighted=true]:bg-[#f3f4f6] dark:data-[highlighted=true]:bg-[#2d2d2d]"
        >
          <UserCircle className="mr-3 h-4 w-4" />
          <div className="flex flex-col">
            <span className="text-black dark:text-gray-300 font-medium">{displayName}</span>
            {userEmail && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</span>
            )}
          </div>
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
        
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('appearance')}
          </p>
        </div>
        <DropdownMenuItem 
          onClick={() => setTheme('light')} 
          className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] data-[highlighted=true]:bg-[#f3f4f6] dark:data-[highlighted=true]:bg-[#2d2d2d]"
        >
          <span className="mr-3 h-4 w-4 flex items-center justify-center">
            <Sun className="h-4 w-4" />
          </span>
          <span className="text-black dark:text-gray-300 font-medium flex-1">
            {language === 'sv' ? 'Ljust' : 'Light'}
          </span>
          {resolvedTheme === 'light' && (
            <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-normal">
              {language === 'sv' ? 'aktiv' : 'active'}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')} 
          className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] data-[highlighted=true]:bg-[#f3f4f6] dark:data-[highlighted=true]:bg-[#2d2d2d]"
        >
          <span className="mr-3 h-4 w-4 flex items-center justify-center">
            <Moon className="h-4 w-4" />
          </span>
          <span className="text-black dark:text-gray-300 font-medium flex-1">
            {language === 'sv' ? 'Mörkt' : 'Dark'}
          </span>
          {resolvedTheme === 'dark' && (
            <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-normal">
              {language === 'sv' ? 'aktiv' : 'active'}
            </span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="mx-[-8px] my-2 dark:bg-[#2d2d2d]" />
        
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {language === 'en' ? 'Language' : 'Språk'}
          </p>
        </div>
        <DropdownMenuItem 
          onClick={() => setLanguage('sv')} 
          className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] data-[highlighted=true]:bg-[#f3f4f6] dark:data-[highlighted=true]:bg-[#2d2d2d]"
        >
          <span className="mr-3 h-4 w-4 flex items-center justify-center">
            {languages.sv.flag}
          </span>
          <span className="text-black dark:text-gray-300 font-medium flex-1">
            {languages.sv.label}
          </span>
          {language === 'sv' && (
            <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-normal">
              {language === 'sv' ? 'aktiv' : 'active'}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('en')} 
          className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] data-[highlighted=true]:bg-[#f3f4f6] dark:data-[highlighted=true]:bg-[#2d2d2d]"
        >
          <span className="mr-3 h-4 w-4 flex items-center justify-center">
            {languages.en.flag}
          </span>
          <span className="text-black dark:text-gray-300 font-medium flex-1">
            {languages.en.label}
          </span>
          {language === 'en' && (
            <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] font-normal">
              {language === 'en' ? 'active' : 'aktiv'}
            </span>
          )}
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
