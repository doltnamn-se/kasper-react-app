
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVersionLogs, VersionChange } from "@/hooks/useVersionLogs";
import { format, parseISO } from "date-fns";
import { useVersionStore } from "@/config/version";

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
        <CardHeader>
          {/* Removed the redundant CardTitle */}
        </CardHeader>
        <CardContent>
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
            <div className="space-y-4">
              {versionLogs?.map((log, index) => (
                <div key={log.id} className={`${index < versionLogs.length - 1 ? 'border-b pb-4' : 'pb-4'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">
                      {log.version_string}
                      {log.version_string === currentVersion && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </h3>
                    <span className="text-sm text-muted-foreground">{formatReleaseDate(log.release_date)}</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {log.changes.map((change: VersionChange, changeIndex: number) => (
                      <li key={changeIndex} className={getChangeTypeClass(change.type)}>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVersionLog;

