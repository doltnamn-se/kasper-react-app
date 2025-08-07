
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
  
  return (
    <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex justify-between items-center z-[1000]">
      <LanguageSwitch />
      <span className="text-xs text-[#5e5e5e] dark:text-gray-400">v{version}</span>
    </div>
  );
};
