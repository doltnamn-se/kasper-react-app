
import { useURLManagement } from "./hooks/useURLManagement";
import { URLTable } from "./URLTable";
import { useLanguage } from "@/contexts/LanguageContext";

export const AdminDeindexingView = () => {
  const { urls, handleStatusChange } = useURLManagement();
  const { language } = useLanguage();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-[700] tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {language === 'sv' ? 'Länkhantering' : 'Link Management'}
      </h1>
      <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
        <div className="max-w-full">
          <URLTable urls={urls} onStatusChange={handleStatusChange} />
        </div>
      </div>
    </div>
  );
};

