
import { useURLManagement } from "./hooks/useURLManagement";
import { URLTable } from "./URLTable";

export const AdminDeindexingView = () => {
  const { urls, handleStatusChange } = useURLManagement();

  return (
    <div>
      <URLTable urls={urls} onStatusChange={handleStatusChange} />
    </div>
  );
};
