import { LanguageSwitch } from "@/components/LanguageSwitch";
import { useQuery } from "@tanstack/react-query";
import { getAppVersion } from "@/config/version";

export const SidebarFooter = () => {
  const { data: version } = useQuery({
    queryKey: ['app-version'],
    queryFn: getAppVersion,
    initialData: "0.0.1"
  });

  return (
    <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex justify-between items-center">
      <LanguageSwitch />
      <span className="text-xs text-[#5e5e5e] dark:text-gray-400">v{version}</span>
    </div>
  );
};