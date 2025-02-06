
import { useURLManagement } from "./hooks/useURLManagement";
import { URLTable } from "./URLTable";

export const AdminDeindexingView = () => {
  const { urls, handleStatusChange } = useURLManagement();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        URL Management
      </h1>
      <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
        <div className="max-w-full">
          <URLTable urls={urls} onStatusChange={handleStatusChange} />
        </div>
      </div>
    </div>
  );
};
