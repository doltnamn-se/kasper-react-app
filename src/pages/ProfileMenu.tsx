import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserCircle, CreditCard, Settings, LogOut, Sun, Moon, MessageSquareText } from "lucide-react";
import { useTheme } from "next-themes";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ProfileMenu() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { setTheme, resolvedTheme } = useTheme();
  const { userProfile, userEmail, isSigningOut, setIsSigningOut } = useUserProfile();
  const [signingOut, setSigningOut] = useState(false);

  const languages = {
    sv: { flag: '🇸🇪', label: 'Svenska' },
    en: { flag: '🇬🇧', label: 'English' }
  };
  
  const displayName = userProfile?.display_name || userEmail || t('profile.manage');

  const getProfileBackground = () => {
    const plan = (userProfile as any)?.subscription_plan;
    if (!plan) return '';
    
    if (plan.includes('personskydd')) {
      return "url('/lovable-uploads/kasper-profil-personskydd.png')";
    } else if (plan.includes('parskydd')) {
      return "url('/lovable-uploads/kasper-profil-parskydd.png')";
    } else if (plan.includes('familjeskydd')) {
      return "url('/lovable-uploads/kasper-profil-familjeskydd.png')";
    }
    return '';
  };

  const handleSignOut = async () => {
    if (signingOut || isSigningOut) {
      console.log("Sign out already in progress");
      return;
    }

    try {
      setSigningOut(true);
      setIsSigningOut(true);
      console.log("Starting sign out process...");

      localStorage.removeItem('supabase.auth.token');
      
      try {
        await supabase.auth.signOut();
        console.log("Sign out successful");
      } catch (signOutError) {
        console.log("Sign out error caught:", signOutError);
      }

      console.log("Redirecting to auth page");
      window.location.href = '/auth';
      
    } catch (err) {
      console.error("Unexpected error during sign out:", err);
      toast.error(t('error.signout'));
    } finally {
      setSigningOut(false);
      setIsSigningOut(false);
    }
  };

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    sublabel, 
    onClick, 
    showActive, 
    activeLabel 
  }: { 
    icon: any; 
    label: string; 
    sublabel?: string; 
    onClick: () => void;
    showActive?: boolean;
    activeLabel?: string;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-start py-3 px-4 hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] transition-colors"
    >
      <Icon className="mr-3 h-4 w-4 mt-0.5 flex-shrink-0 text-[#121212] dark:text-[#ffffff]" />
      <div className="flex flex-col flex-1 text-left">
        <span className="text-sm text-black dark:text-gray-300 font-medium">{label}</span>
        {sublabel && (
          <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] mt-0.5">{sublabel}</span>
        )}
      </div>
      {showActive && (
        <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6] ml-2 self-center">
          {activeLabel}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-transparent space-y-4">
      {/* Profile Section Container */}
      <div 
        className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 overflow-hidden bg-cover bg-center relative h-40"
        style={{ backgroundImage: getProfileBackground() }}
      >
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
            {language === 'sv' ? 'Prenumeration' : 'Subscription'}
          </span>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="text-sm text-white font-medium">{displayName}</span>
        </div>
        <img 
          src="/lovable-uploads/kasper-profil-k-ikon.svg" 
          alt="Profile icon" 
          className="absolute top-4 right-4 w-6 h-6"
        />
      </div>

      {/* Menu Items Container */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200 overflow-hidden">

        {/* Support */}
        <MenuItem
          icon={MessageSquareText}
          label={language === 'sv' ? 'Support' : 'Support'}
          onClick={() => navigate("/chat")}
        />

        {/* Billing */}
        <MenuItem
          icon={CreditCard}
          label={t('profile.billing')}
          onClick={() => window.location.href = 'https://billing.stripe.com/p/login/eVa4ifayTfS48la7ss'}
        />

        {/* Settings */}
        <MenuItem
          icon={Settings}
          label={t('profile.settings')}
          onClick={() => navigate("/settings")}
        />

        <Separator className="my-2 dark:bg-[#2d2d2d]" />

        {/* Appearance Section */}
        <div className="px-4 py-3">
          <p className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('appearance')}
          </p>
        </div>
        
        <MenuItem
          icon={Sun}
          label={language === 'sv' ? 'Ljust' : 'Light'}
          onClick={() => setTheme('light')}
          showActive={resolvedTheme === 'light'}
          activeLabel={language === 'sv' ? 'aktiv' : 'active'}
        />
        
        <MenuItem
          icon={Moon}
          label={language === 'sv' ? 'Mörkt' : 'Dark'}
          onClick={() => setTheme('dark')}
          showActive={resolvedTheme === 'dark'}
          activeLabel={language === 'sv' ? 'aktiv' : 'active'}
        />

        <Separator className="my-2 dark:bg-[#2d2d2d]" />

        {/* Language Section */}
        <div className="px-4 py-3">
          <p className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {language === 'en' ? 'Language' : 'Språk'}
          </p>
        </div>
        
        <button
          onClick={() => setLanguage('sv')}
          className="w-full flex items-center py-3 px-4 hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] transition-colors"
        >
          <span className="mr-3 text-xl">{languages.sv.flag}</span>
          <span className="text-sm text-black dark:text-gray-300 font-medium flex-1 text-left">
            {languages.sv.label}
          </span>
          {language === 'sv' && (
            <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
              {language === 'sv' ? 'aktiv' : 'active'}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setLanguage('en')}
          className="w-full flex items-center py-3 px-4 hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] transition-colors"
        >
          <span className="mr-3 text-xl">{languages.en.flag}</span>
          <span className="text-sm text-black dark:text-gray-300 font-medium flex-1 text-left">
            {languages.en.label}
          </span>
          {language === 'en' && (
            <span className="text-xs text-[#000000A6] dark:text-[#FFFFFFA6]">
              {language === 'en' ? 'active' : 'aktiv'}
            </span>
          )}
        </button>

        <Separator className="my-2 dark:bg-[#2d2d2d]" />

        {/* Sign Out */}
        <MenuItem
          icon={LogOut}
          label={signingOut ? t('profile.signing.out') : t('profile.sign.out')}
          onClick={handleSignOut}
        />
      </div>
    </div>
  );
}
