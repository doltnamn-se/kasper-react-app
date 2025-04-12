
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { handleQueryResult } from "@/utils/supabaseHelpers";

export interface VersionChange {
  type: string;
  description: string;
}

export interface VersionLog {
  id: string;
  version_string: string;
  release_date: string;
  changes: VersionChange[];
  created_at: string;
  updated_at: string;
}

export const useVersionLogs = () => {
  return useQuery({
    queryKey: ["version-logs"],
    queryFn: async (): Promise<VersionLog[]> => {
      const { data, error } = await supabase
        .from("version_logs")
        .select("*")
        .order("release_date", { ascending: false });
      
      const result = handleQueryResult(data, error);
      
      if (!result) {
        console.error("Failed to fetch version logs");
        return [];
      }
      
      // Parse the JSON changes field to convert it to the VersionChange[] type
      return result.map(item => ({
        ...item,
        changes: Array.isArray(item.changes) 
          ? item.changes 
          : typeof item.changes === 'string' 
            ? JSON.parse(item.changes) 
            : JSON.parse(JSON.stringify(item.changes))
      })) as VersionLog[];
    }
  });
};
