import { LanguageSwitch } from "@/components/LanguageSwitch";
import { APP_VERSION } from "@/config/version";

export const SidebarFooter = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex justify-between items-center">
      <LanguageSwitch />
      <span className="text-xs text-[#5e5e5e] dark:text-gray-400">v{APP_VERSION}</span>
    </div>
  );
};