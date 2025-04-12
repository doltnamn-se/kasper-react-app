
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVersionLogs, VersionChange } from "@/hooks/useVersionLogs";
import { format, parseISO } from "date-fns";
import { useVersionStore } from "@/config/version";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

  // Function to get the title (first change) and remaining changes
  const getVersionContent = (changes: VersionChange[]) => {
    if (!changes || changes.length === 0) {
      return { title: "Version update", remainingChanges: [] };
    }
    
    // Use the first change as the title
    const title = changes[0].description;
    
    // The remaining changes (exclude the first one)
    const remainingChanges = changes.slice(1);
    
    return { title, remainingChanges };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('nav.admin.version.log')}</h1>
      </div>

      <Card className="rounded-[4px]">
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
                {versionLogs?.map((log, index) => {
                  const { title, remainingChanges } = getVersionContent(log.changes);
                  
                  return (
                    <div key={log.id} className="relative pl-14">
                      {/* Version indicator - now black for current version */}
                      <Badge 
                        variant="static"
                        className={cn(
                          "absolute left-0 flex items-center justify-center w-12 h-6 rounded-full text-xs font-medium",
                          log.version_string === currentVersion
                            ? "bg-black text-white dark:bg-black dark:text-white"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        )}
                      >
                        {log.version_string}
                      </Badge>
                      
                      <div className="mb-2 ml-14">
                        <h3 className="text-lg font-medium">
                          {title}
                        </h3>
                        <div className="text-sm text-[#000000A6] font-medium">
                          Development Team • {formatReleaseDate(log.release_date)}
                        </div>
                      </div>
                      
                      {remainingChanges.length > 0 && (
                        <ul className="space-y-2 mt-3 ml-14">
                          {remainingChanges.map((change: VersionChange, changeIndex: number) => (
                            <li 
                              key={changeIndex} 
                              className="text-sm text-gray-800 dark:text-gray-200"
                            >
                              {change.description}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}

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

