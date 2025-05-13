
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useVersionStore } from "@/config/version";
import { Globe } from "lucide-react";

export const SidebarFooter = () => {
  const version = useVersionStore((state) => state.version);

  return (
    <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex justify-between items-center z-[1000]">
      <div className="flex items-center gap-1">
        <Globe className="h-4 w-4 text-[#4c4c49] dark:text-[#67676c]" />
        <LanguageSwitch />
      </div>
      <span className="text-xs text-[#5e5e5e] dark:text-gray-400">v{version}</span>
    </div>
  );
};
