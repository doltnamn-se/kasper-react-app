
import { useState } from "react";
import { useVersionLogs } from "@/hooks/useVersionLogs";
import { exportVersionLogsToCSV, exportVersionLogsToPDF } from "@/utils/exportUtils";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { format } from "date-fns";
import { Suspense, lazy } from "react";
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { toast } from "@/components/ui/use-toast";

const FilePdfIcon = lazy(() => import("lucide-react").then(mod => ({ default: mod.FilePdf })));
const FileTextIcon = lazy(() => import("lucide-react").then(mod => ({ default: mod.FileText })));

const AdminVersionLog = () => {
  const { data: versionLogs, isLoading, error } = useVersionLogs();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    try {
      if (!versionLogs || versionLogs.length === 0) {
        toast({
          title: "Export Failed",
          description: "No version logs to export",
          variant: "destructive",
        });
        return;
      }
      
      exportVersionLogsToCSV(versionLogs);
      
      toast({
        title: "Export Successful",
        description: "Version logs exported to CSV",
      });
    } catch (error) {
      console.error("CSV export error:", error);
      toast({
        title: "Export Failed",
        description: "Could not export to CSV",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      if (!versionLogs || versionLogs.length === 0) {
        toast({
          title: "Export Failed",
          description: "No version logs to export",
          variant: "destructive",
        });
        return;
      }
      
      await exportVersionLogsToPDF(versionLogs);
      
      toast({
        title: "Export Successful",
        description: "Version logs exported to PDF",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "Could not export to PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminHeader 
        title="Version Log" 
        description="View and manage application version history"
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1"
          >
            <Suspense fallback={<div className="w-4 h-4" />}>
              <FileTextIcon className="w-4 h-4" />
            </Suspense>
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-1"
          >
            <Suspense fallback={<div className="w-4 h-4" />}>
              <FilePdfIcon className="w-4 h-4" />
            </Suspense>
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </AdminHeader>

      <div className="rounded-lg border bg-white dark:bg-[#1c1c1e] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Loading version history...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Error loading version history
          </div>
        ) : versionLogs?.length === 0 ? (
          <div className="p-8 text-center">No version history available</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {versionLogs?.map((log) => (
              <div key={log.id} className="p-6">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                  <h3 className="text-lg font-semibold">
                    Version {log.version_string}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(log.release_date), "MMMM d, yyyy")}
                  </span>
                </div>
                <ul className="space-y-2 pl-6 list-disc">
                  {log.changes.map((change, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">
                      {change.description}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVersionLog;
