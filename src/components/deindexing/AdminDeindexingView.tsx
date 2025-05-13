
import { useURLManagement } from "./hooks/useURLManagement";
import { URLTable } from "./URLTable";
import { useEffect } from "react";

export const AdminDeindexingView = () => {
  const { urls, handleStatusChange, handleDeleteUrl } = useURLManagement();

  // Log the number of URLs received for debugging
  useEffect(() => {
    console.log(`AdminDeindexingView: Received ${urls.length} URLs`);
  }, [urls.length]);

  return (
    <div>
      <URLTable 
        urls={urls} 
        onStatusChange={handleStatusChange} 
        onDelete={handleDeleteUrl}
      />
    </div>
  );
};
