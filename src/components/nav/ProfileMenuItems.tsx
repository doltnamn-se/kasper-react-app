import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserCircle, CreditCard, Settings, LogOut, Sun, Moon, Bell, CircleFadingArrowUp, MessageSquareText } from "lucide-react";
import { useTheme } from "next-themes";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileMenuItemsProps {
  onSignOut: () => void;
  isSigningOut: boolean;
}

export const ProfileMenuItems = ({ onSignOut, isSigningOut }: ProfileMenuItemsProps) => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { setTheme, resolvedTheme } = useTheme();
  const { userProfile, userEmail } = useUserProfile();
  const isMobile = useIsMobile();

  // Fetch customer members
  const { data: customerMembers } = useQuery({
    queryKey: ['customer-members', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      const { data, error } = await supabase
        .from('customer_members')
        .select('*')
        .eq('customer_id', userProfile.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.id,
  });

  const languages = {
    sv: { flag: '🇸🇪', label: 'Svenska' },
    en: { flag: '🇬🇧', label: 'English' }
  };
  
  // Get the display name from userProfile or fall back to email
  const displayName = userProfile?.display_name || userEmail || t('profile.manage');
  
  // Updated condition: Show button only if user is not on 24-month plan AND has a subscription plan
  const shouldShowPlanButton = userProfile?.subscription_plan !== '24_months' && userProfile?.subscription_plan !== null;

  const getProfileBackground = () => {
    const plan = (userProfile as any)?.subscription_plan;
    if (!plan) return '';
    
    // New plans
    if (plan.includes('personskydd')) {
      return "url('/lovable-uploads/kasper-profil-personskydd.png')";
    } else if (plan.includes('parskydd')) {
      return "url('/lovable-uploads/kasper-profil-parskydd.png')";
    } else if (plan.includes('familjeskydd')) {
      return "url('/lovable-uploads/kasper-profil-familjeskydd.png')";
    }
    
    // Old plans (1_month, 3_months, 6_months, 12_months, 24_months) - default to personskydd
    return "url('/lovable-uploads/kasper-profil-personskydd.png')";
  };

  const formatSubscriptionPlan = (plan: string) => {
    if (!plan) return '';
    
    // Handle new plan format (e.g., "personskydd_1_year")
    if (plan.includes('_year')) {
      const parts = plan.toLowerCase().split('_');
      if (parts.length < 1) return plan;
      
      const planKey = parts[0];
      const planTranslations: Record<string, { sv: string; en: string }> = {
        personskydd: { sv: 'Personskydd', en: 'Personal Protection' },
        parskydd: { sv: 'Parskydd', en: 'Couple Protection' },
        familjeskydd: { sv: 'Familjeskydd', en: 'Family Protection' }
      };
      
      return planTranslations[planKey]?.[language] || planKey.charAt(0).toUpperCase() + planKey.slice(1);
    }
    
    // Handle old plan format (1_month, 3_months, etc.) - show as Personskydd
    return language === 'sv' ? 'Personskydd' : 'Personal Protection';
  };

  return (
    <>
      {/* New Profile Container */}
      <div 
        className="bg-white dark:bg-[#1c1c1e] rounded-lg overflow-hidden bg-cover bg-center relative mb-2 -m-2"
        style={{ backgroundImage: getProfileBackground() }}
      >
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.20) 100%)' }}></div>
        <div className="relative z-10 pt-4 px-4 pb-4">
          <div className="flex gap-2 mb-20">
            <span className="inline-block px-3 py-1 bg-black/40 backdrop-blur-sm text-white font-normal" style={{ borderRadius: '6px', fontSize: '0.8rem' }}>
              {language === 'sv' ? 'Prenumeration' : 'Subscription'}
            </span>
            <span className="inline-block px-3 py-1 bg-black/20 backdrop-blur-sm text-white font-normal" style={{ borderRadius: '6px', fontSize: '0.8rem' }}>
              {language === 'sv' ? 'Aktiv' : 'Active'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {(userProfile as any)?.subscription_plan && (
              <span className="text-white font-medium" style={{ fontSize: '1rem' }}>
                {formatSubscriptionPlan((userProfile as any).subscription_plan)}
              </span>
            )}
            <span className="text-white/80 font-medium" style={{ fontSize: '1rem' }}>{displayName}</span>
            {customerMembers && customerMembers.length > 0 && (
              <>
                {customerMembers.map((member) => (
                  <span key={member.id} className="text-white/80 font-medium" style={{ fontSize: '1rem' }}>
                    {member.display_name}
                  </span>
                ))}
              </>
            )}
          </div>
        </div>
        <img 
          src="/lovable-uploads/kasper-profil-k-ikon.svg" 
          alt="Profile icon" 
          className="absolute top-4 right-4 w-6 h-6 z-10"
        />
      </div>

      <DropdownMenuSeparator className="mx-[-8px] my-2 dark:bg-[#2d2d2d]" />

      <DropdownMenuGroup>
        {/* REPLACED: Notifications replaced with Support */}
        <DropdownMenuItem 
          onClick={() => navigate("/chat")}
          className="py-2 cursor-pointer hover:bg-[#f3f4f6] dark:hover:bg-[#2d2d2d] data-[highlighted=true]:bg-[#f3f4f6] dark:data-[highlighted=true]:bg-[#2d2d2d]"
        >
          <MessageSquareText className="mr-3 h-4 w-4" />
          <span className="text-black dark:text-gray-300 font-medium">{language === 'sv' ? 'Support' : 'Support'}</span>
        </DropdownMenuItem>
        
        {/* SWAPPED: Billing now comes after Support */}
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
