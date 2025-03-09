
import { useURLManagement } from "./hooks/useURLManagement";
import { URLTable } from "./URLTable";
import { useLanguage } from "@/contexts/LanguageContext";

export const AdminDeindexingView = () => {
  const { urls, handleStatusChange, handleDeleteUrl } = useURLManagement();
  const { language } = useLanguage();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-[700] tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {language === 'sv' ? 'Länkhantering' : 'Link Management'}
      </h1>
      <div className="transition-colors duration-200">
        <div className="max-w-full">
          <URLTable 
            urls={urls} 
            onStatusChange={handleStatusChange} 
            onDelete={handleDeleteUrl}
          />
        </div>
      </div>
    </div>
  );
};
