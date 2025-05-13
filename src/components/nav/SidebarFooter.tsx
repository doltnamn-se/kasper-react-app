
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useVersionStore } from "@/config/version";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { CircleFadingArrowUp } from "lucide-react";

export const SidebarFooter = () => {
  const version = useVersionStore((state) => state.version);
  const { userProfile } = useUserProfile();
  const { language } = useLanguage();
  
  // Check if user is on 24-month plan
  const isOn24MonthPlan = userProfile?.subscription_plan === '24_months';

  // If the user is on the 24-month plan, show the original footer
  if (isOn24MonthPlan) {
    return (
      <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex justify-between items-center z-[1000]">
        <LanguageSwitch />
        <span className="text-xs text-[#5e5e5e] dark:text-gray-400">v{version}</span>
      </div>
    );
  }

  // Otherwise, show the upgrade button
  return (
    <div className="absolute bottom-0 left-0 right-0 px-6 py-4 z-[1000]">
      <Button 
        onClick={() => window.location.href = 'https://billing.stripe.com/p/login/eVa4ifayTfS48la7ss'} 
        className="w-full flex flex-col items-start py-3"
        variant="outline"
      >
        <div className="flex items-center w-full">
          <CircleFadingArrowUp className="mr-3 h-4 w-4" />
          <div className="flex flex-col">
            <span className="text-black dark:text-gray-300 font-medium">
              {language === 'sv' ? 'Byt plan till 24 mån' : 'Change plan to 24 mo'}
            </span>
            <span className="text-xs text-green-600 dark:text-green-500 -mt-0.5">
              {language === 'sv' ? 'Spara upp till 1 584 kr' : 'Save up to 1 584 kr'}
            </span>
          </div>
        </div>
      </Button>
    </div>
  );
};
