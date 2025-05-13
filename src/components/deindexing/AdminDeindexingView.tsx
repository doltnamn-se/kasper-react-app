
import { useURLManagement } from "./hooks/useURLManagement";
import { URLTable } from "./URLTable";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export const AdminDeindexingView = () => {
  const { urls, handleStatusChange, handleDeleteUrl } = useURLManagement();
  const { t } = useLanguage();

  // Log the number of URLs received for debugging
  useEffect(() => {
    console.log(`AdminDeindexingView: Received ${urls.length} URLs`);
  }, [urls.length]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.admin.deindexing')}
      </h1>
      
      <URLTable 
        urls={urls} 
        onStatusChange={handleStatusChange} 
        onDelete={handleDeleteUrl}
      />
    </div>
  );
};
