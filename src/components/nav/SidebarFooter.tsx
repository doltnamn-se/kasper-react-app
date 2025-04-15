
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useVersionStore } from "@/config/version";

export const SidebarFooter = () => {
  const version = useVersionStore((state) => state.version);

  return (
    <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex justify-between items-center bg-white dark:bg-[#1c1c1e] z-10">
      <LanguageSwitch />
      <span className="text-xs text-[#5e5e5e] dark:text-gray-400">v{version}</span>
    </div>
  );
};
