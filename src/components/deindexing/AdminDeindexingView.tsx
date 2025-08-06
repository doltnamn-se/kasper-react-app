
import { useAdminURLManagement } from "./hooks/useAdminURLManagement";
import { URLTable } from "./URLTable";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export const AdminDeindexingView = () => {
  const { urls, handleStatusChange, handleDeleteUrl } = useAdminURLManagement();
  const { t } = useLanguage();

  // Log the number of URLs received for debugging
  useEffect(() => {
    console.log(`AdminDeindexingView: Received ${urls.length} URLs`);
  }, [urls.length]);

  return (
    <div className="space-y-6">
      <h1>
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
