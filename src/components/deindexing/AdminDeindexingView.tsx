
import { useAdminURLManagement } from "./hooks/useAdminURLManagement";
import { URLTable } from "./URLTable";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Fingerprint } from "lucide-react";

export const AdminDeindexingView = () => {
  const { urls, handleStatusChange, handleDeleteUrl } = useAdminURLManagement();
  const { t, language } = useLanguage();

  // Log the number of URLs received for debugging
  useEffect(() => {
    console.log(`AdminDeindexingView: Received ${urls.length} URLs`);
  }, [urls.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>{t('nav.admin.deindexing')}</h1>
        <Button variant="outline" className="gap-2">
          <Fingerprint className="h-4 w-4" />
          <span>{language === 'sv' ? 'Intyg' : 'Certificate'}</span>
        </Button>
      </div>
      
      <URLTable 
        urls={urls} 
        onStatusChange={handleStatusChange} 
        onDelete={handleDeleteUrl}
      />
    </div>
  );
};
