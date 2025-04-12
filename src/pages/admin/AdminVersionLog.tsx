
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVersionLogs, VersionChange } from "@/hooks/useVersionLogs";
import { format, parseISO } from "date-fns";
import { useVersionStore } from "@/config/version";
import { cn } from "@/lib/utils";

const AdminVersionLog = () => {
  const { t } = useLanguage();
  const { data: versionLogs, isLoading, error } = useVersionLogs();
  const currentVersion = useVersionStore((state) => state.version);

  // Function to format the release date
  const formatReleaseDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "yyyy-MM-dd");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Function to render an icon based on change type
  const getChangeTypeClass = (type: string) => {
    switch (type) {
      case "feature":
        return "text-blue-600 dark:text-blue-400";
      case "improvement":
        return "text-green-600 dark:text-green-400";
      case "fix":
        return "text-amber-600 dark:text-amber-400";
      case "security":
        return "text-red-600 dark:text-red-400";
      case "performance":
        return "text-purple-600 dark:text-purple-400";
      case "major":
        return "text-indigo-600 dark:text-indigo-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('nav.admin.version.log')}</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-2 text-sm text-muted-foreground">Loading version history...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">
              <p>Failed to load version history. Please try again later.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline vertical line */}
              <div className="absolute left-[24px] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              
              <div className="space-y-8">
                {versionLogs?.map((log, index) => (
                  <div key={log.id} className="relative pl-14">
                    {/* Version indicator */}
                    <div 
                      className={cn(
                        "absolute left-0 flex items-center justify-center w-12 h-6 rounded-full text-xs font-medium",
                        log.version_string === currentVersion
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      )}
                    >
                      {log.version_string}
                    </div>
                    
                    <div className="mb-1 flex items-baseline">
                      <h3 className="text-lg font-semibold">
                        {log.version_string === currentVersion && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </h3>
                      <span className="ml-auto text-sm text-muted-foreground">{formatReleaseDate(log.release_date)}</span>
                    </div>
                    
                    <ul className="space-y-2 mt-2">
                      {log.changes.map((change: VersionChange, changeIndex: number) => (
                        <li 
                          key={changeIndex} 
                          className={cn(
                            "text-sm",
                            getChangeTypeClass(change.type)
                          )}
                        >
                          {change.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {versionLogs?.length === 0 && (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground">No version history available.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVersionLog;
