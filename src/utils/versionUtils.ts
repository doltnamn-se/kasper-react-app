
import { supabase } from "@/integrations/supabase/client";
import { VersionChange } from "@/hooks/useVersionLogs";

/**
 * Add a new version to the version_logs table
 */
export const addNewVersion = async (
  versionString: string, 
  releaseDate: Date,
  changes: VersionChange[]
) => {
  try {
    // Convert the changes array to a JSON string that Supabase can handle
    const changesJson = JSON.stringify(changes);
    
    const { data, error } = await supabase
      .from("version_logs")
      .insert([
        {
          version_string: versionString,
          release_date: releaseDate.toISOString(),
          changes: changesJson
        }
      ])
      .select();

    if (error) {
      console.error("Error adding new version:", error);
      return null;
    }
    
    if (data?.[0]) {
      return {
        ...data[0],
        changes: Array.isArray(data[0].changes) 
          ? data[0].changes 
          : JSON.parse(data[0].changes as string)
      };
    }
    
    return null;
  } catch (err) {
    console.error("Exception adding new version:", err);
    return null;
  }
};

/**
 * Gets the latest version from the version_logs table
 */
export const getLatestVersion = async () => {
  try {
    const { data, error } = await supabase
      .from("version_logs")
      .select("*")
      .order("release_date", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error getting latest version:", error);
      return null;
    }
    
    // Parse the changes field if it exists
    if (data) {
      return {
        ...data,
        changes: Array.isArray(data.changes) 
          ? data.changes 
          : JSON.parse(data.changes as string)
      };
    }
    
    return null;
  } catch (err) {
    console.error("Exception getting latest version:", err);
    return null;
  }
};
