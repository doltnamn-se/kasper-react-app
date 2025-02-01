import { useURLManagement } from "./hooks/useURLManagement";
import { URLTable } from "./URLTable";

export const AdminDeindexingView = () => {
  const { urls, handleStatusChange } = useURLManagement();

  return (
    <div className="container mx-auto py-6">
      <URLTable urls={urls} onStatusChange={handleStatusChange} />
    </div>
  );
};