import { useLanguage } from "@/contexts/LanguageContext";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProfileMenuItemsProps {
  onSignOut: () => Promise<void>;
  isSigningOut: boolean;
}

export const ProfileMenuItems = ({ onSignOut, isSigningOut }: ProfileMenuItemsProps) => {
  const { t } = useLanguage();

  const handleBillingClick = () => {
    window.location.href = "https://billing.stripe.com/p/login/eVa4ifayTfS48la7ss";
  };

  return (
    <>
      <Link to="/settings">
        <DropdownMenuItem className="cursor-pointer">
          {t('profile.manage')}
        </DropdownMenuItem>
      </Link>
      <DropdownMenuItem onClick={handleBillingClick} className="cursor-pointer">
        {t('profile.billing')}
      </DropdownMenuItem>
      <DropdownMenuItem 
        onClick={onSignOut} 
        disabled={isSigningOut}
        className="cursor-pointer text-red-600 dark:text-red-400"
      >
        {isSigningOut ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('profile.signing.out')}
          </>
        ) : (
          t('profile.sign.out')
        )}
      </DropdownMenuItem>
    </>
  );
};